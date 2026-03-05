import { eq, sql } from 'drizzle-orm';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { auth } from '@/lib/auth';
import { calculateNetBalance } from '@/lib/expenses';
import { db } from '@/lib/drizzle';
import { expenses, loans } from '@/lib/drizzle/schema/expenses';
import { users } from '@/lib/drizzle/schema/users';
import type { ExpenseSummary } from '@/types/expenses';

/**
 * GET /api/tools/expenses/summary - Server-calculated dashboard summary for current user.
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const userId = +session.user.id;

        const [userCurrency] = await db
            .select({ preferred_currency: users.preferred_currency })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        const [expenseTotals] = await db
            .select({
                total_income:
                    sql<number>`coalesce(sum(case when ${expenses.type} = 'income' then ${expenses.amount} else 0 end), 0)`,
                total_expense:
                    sql<number>`coalesce(sum(case when ${expenses.type} = 'expense' then ${expenses.amount} else 0 end), 0)`,
            })
            .from(expenses)
            .where(eq(expenses.user_id, userId));

        const [loanTotals] = await db
            .select({
                borrowed_outstanding:
                    sql<number>`coalesce(sum(case when ${loans.type} = 'borrowed' then ${loans.principal_amount} - ${loans.paid_amount} else 0 end), 0)`,
                lent_outstanding:
                    sql<number>`coalesce(sum(case when ${loans.type} = 'lent' then ${loans.principal_amount} - ${loans.paid_amount} else 0 end), 0)`,
                active_borrowed_count:
                    sql<number>`coalesce(sum(case when ${loans.type} = 'borrowed' and ${loans.status} = 'active' then 1 else 0 end), 0)`,
                active_lent_count:
                    sql<number>`coalesce(sum(case when ${loans.type} = 'lent' and ${loans.status} = 'active' then 1 else 0 end), 0)`,
            })
            .from(loans)
            .where(eq(loans.user_id, userId));

        const summary: ExpenseSummary = {
            currency: userCurrency?.preferred_currency || 'USD',
            total_income: Number(expenseTotals?.total_income || 0),
            total_expense: Number(expenseTotals?.total_expense || 0),
            borrowed_outstanding: Number(loanTotals?.borrowed_outstanding || 0),
            lent_outstanding: Number(loanTotals?.lent_outstanding || 0),
            active_borrowed_count: Number(loanTotals?.active_borrowed_count || 0),
            active_lent_count: Number(loanTotals?.active_lent_count || 0),
            net_balance: 0,
        };

        summary.net_balance = calculateNetBalance(summary);

        return sendResponse('Expense', 'GET', summary);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
