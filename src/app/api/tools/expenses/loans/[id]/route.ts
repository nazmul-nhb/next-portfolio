import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import type z from 'zod';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { loans } from '@/lib/drizzle/schema/expenses';
import { UpdateLoanSchema } from '@/lib/zod-schema/expenses';

type Params = {
    params: Promise<{ id: string }>;
};

/**
 * PATCH /api/tools/expenses/loans/[id] - update or settle a loan.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
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

        const [loan] = await db
            .select()
            .from(loans)
            .where(and(eq(loans.id, loanId), eq(loans.user_id, userId)))
            .limit(1);

        if (!loan) {
            return sendErrorResponse('Loan not found', 404);
        }

        const body = (await req.json()) as z.infer<typeof UpdateLoanSchema>;
        const validation = await validateRequest(UpdateLoanSchema, body);

        if (!validation.success) return validation.response;

        const patchData = { ...validation.data };

        if (patchData.status === 'settled') {
            patchData.status = 'settled';
        }

        const [updated] = await db
            .update(loans)
            .set({
                ...patchData,
                paid_amount:
                    patchData.status === 'settled' ? loan.principal_amount : loan.paid_amount,
            })
            .where(and(eq(loans.id, loanId), eq(loans.user_id, userId)))
            .returning();

        revalidatePath('/tools/expenses');

        return sendResponse('Loan', 'PATCH', {
            ...updated,
            remaining_amount: Math.max(0, updated.principal_amount - updated.paid_amount),
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * DELETE /api/tools/expenses/loans/[id] - delete a loan and all related payments.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
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

        const [deleted] = await db
            .delete(loans)
            .where(and(eq(loans.id, loanId), eq(loans.user_id, userId)))
            .returning();

        if (!deleted) {
            return sendErrorResponse('Loan not found', 404);
        }

        revalidatePath('/tools/expenses');

        return sendResponse('Loan', 'DELETE', deleted);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
