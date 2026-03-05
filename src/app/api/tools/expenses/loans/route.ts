import { and, desc, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import type z from 'zod';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { loanPayments, loans } from '@/lib/drizzle/schema/expenses';
import { CreateLoanSchema } from '@/lib/zod-schema/expenses';
import type { LoanItem } from '@/types/expenses';

/**
 * GET /api/tools/expenses/loans - list loans owned by current user.
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const userId = +session.user.id;
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status');

        const conditions = [eq(loans.user_id, userId)];

        if (type === 'borrowed' || type === 'lent') {
            conditions.push(eq(loans.type, type));
        }

        if (status === 'active' || status === 'settled') {
            conditions.push(eq(loans.status, status));
        }

        const rows = await db
            .select({
                id: loans.id,
                user_id: loans.user_id,
                title: loans.title,
                counterparty: loans.counterparty,
                notes: loans.notes,
                type: loans.type,
                principal_amount: loans.principal_amount,
                paid_amount: loans.paid_amount,
                status: loans.status,
                due_date: loans.due_date,
                start_date: loans.start_date,
                created_at: loans.created_at,
                updated_at: loans.updated_at,
                remaining_amount: sql<number>`${loans.principal_amount} - ${loans.paid_amount}`,
                payments_count:
                    sql<number>`coalesce((select count(*) from ${loanPayments} where ${loanPayments.loan_id} = ${loans.id}), 0)`,
            })
            .from(loans)
            .where(and(...conditions))
            .orderBy(desc(loans.created_at));

        const mapped: LoanItem[] = rows.map((loan) => ({
            ...loan,
            remaining_amount: Number(loan.remaining_amount || 0),
            payments_count: Number(loan.payments_count || 0),
        }));

        return sendResponse('Loan', 'GET', mapped);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * POST /api/tools/expenses/loans - create borrowed/lent loan entry.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const userId = +session.user.id;
        const body = (await req.json()) as z.infer<typeof CreateLoanSchema>;
        const validation = await validateRequest(CreateLoanSchema, body);

        if (!validation.success) return validation.response;

        const [newLoan] = await db
            .insert(loans)
            .values({
                ...validation.data,
                user_id: userId,
                counterparty: validation.data.counterparty || null,
                notes: validation.data.notes || null,
                paid_amount: 0,
                status: 'active',
            })
            .returning();

        revalidatePath('/tools/expenses');

        return sendResponse('Loan', 'POST', {
            ...newLoan,
            remaining_amount: newLoan.principal_amount,
            payments_count: 0,
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}
