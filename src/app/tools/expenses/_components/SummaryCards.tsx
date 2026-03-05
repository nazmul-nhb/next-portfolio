import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ExpenseSummary } from '@/types/expenses';

type SummaryCardsProps = {
    summary: ExpenseSummary | undefined;
    money: (value: number) => string;
};

export function SummaryCards({ money, summary }: SummaryCardsProps) {
    return (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Total Income</CardDescription>
                    <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                        {money(summary?.total_income || 0)}
                    </CardTitle>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Total Expense</CardDescription>
                    <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                        {money(summary?.total_expense || 0)}
                    </CardTitle>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Active Loans</CardDescription>
                    <CardTitle className="text-2xl">
                        {(summary?.active_borrowed_count || 0) +
                            (summary?.active_lent_count || 0)}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Borrowed: {summary?.active_borrowed_count || 0} • Lent:{' '}
                        {summary?.active_lent_count || 0}
                    </p>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Cash In Hand</CardDescription>
                    <CardTitle
                        className={`text-2xl ${
                            (summary?.net_balance || 0) >= 0
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-red-600 dark:text-red-400'
                        }`}
                    >
                        {money(summary?.net_balance || 0)}
                    </CardTitle>
                </CardHeader>
            </Card>
        </section>
    );
}
