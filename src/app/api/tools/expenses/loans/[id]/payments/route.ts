import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import type z from 'zod';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { loanPayments, loans } from '@/lib/drizzle/schema/expenses';
import { PaymentSchema } from '@/lib/zod-schema/expenses';

type Params = {
    params: Promise<{ id: string }>;
};

/**
 * POST /api/tools/expenses/loans/[id]/payments - add partial/full repayment.
 */
export async function POST(req: NextRequest, { params }: Params) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const userId = +session.user.id;
        const { id } = await params;
        const loanId = Number(id);

        if (!loanId || Number.isNaN(loanId)) {
            return sendErrorResponse('Invalid loan id', 400);
        }

        const body = (await req.json()) as z.infer<typeof PaymentSchema>;
        const validation = await validateRequest(PaymentSchema, body);

        if (!validation.success) return validation.response;

        const result = await db.transaction(async (tx) => {
            const [loan] = await tx
                .select()
                .from(loans)
                .where(and(eq(loans.id, loanId), eq(loans.user_id, userId)))
                .limit(1);

            if (!loan) {
                throw new Error('Loan not found');
            }

            const remaining = loan.principal_amount - loan.paid_amount;

            if (remaining <= 0 || loan.status === 'settled') {
                throw new Error('Loan is already settled');
            }

            if (validation.data.amount > remaining) {
                throw new Error('Payment amount cannot exceed remaining balance');
            }

            const [payment] = await tx
                .insert(loanPayments)
                .values({
                    loan_id: loan.id,
                    user_id: userId,
                    amount: validation.data.amount,
                    note: validation.data.note || null,
                    payment_date: validation.data.payment_date || new Date(),
                })
                .returning();

            const paidAmount = loan.paid_amount + validation.data.amount;
            const nextStatus = paidAmount >= loan.principal_amount ? 'settled' : 'active';

            const [updatedLoan] = await tx
                .update(loans)
                .set({
                    paid_amount: paidAmount,
                    status: nextStatus,
                })
                .where(eq(loans.id, loan.id))
                .returning();

            return {
                payment,
                loan: {
                    ...updatedLoan,
                    remaining_amount: Math.max(
                        0,
                        updatedLoan.principal_amount - updatedLoan.paid_amount
                    ),
                },
            };
        });

        revalidatePath('/tools/expenses');

        return sendResponse('Loan Payment', 'POST', result);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : error;
        if (errMsg === 'Loan not found') return sendErrorResponse(errMsg, 404);
        if (
            errMsg === 'Loan is already settled' ||
            errMsg === 'Payment amount cannot exceed remaining balance'
        ) {
            return sendErrorResponse(errMsg, 400);
        }
        return sendErrorResponse(error);
    }
}
