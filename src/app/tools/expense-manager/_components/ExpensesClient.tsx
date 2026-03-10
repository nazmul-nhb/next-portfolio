'use client';

import { AlertTriangle, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { generateQueryParams } from 'nhb-toolbox';
import { useEffect, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import type { CurrencyResponse } from '@/app/tools/expense-manager/_components/types';
import { ExpensePageSkeleton } from '@/components/misc/skeletons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/lib/expenses';
import { useApiQuery } from '@/lib/hooks/use-api';
import type { Uncertain } from '@/types';
import type { ExpenseSummary, LoanItem, PaginatedExpenses } from '@/types/expenses';
import { AddEntryDialog } from './AddEntryDialog';
import { CurrencyCard } from './CurrencyCard';
import { EntriesSection } from './EntriesSection';
import { LoansSection } from './LoansSection';
import { RepaymentDialog } from './RepaymentDialog';
import { SummaryCards } from './SummaryCards';

export function ExpensesClient() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [timeframe, setTimeframe] = useState<'all' | 'range'>('all');
    const [dateRange, setDateRange] = useState<Uncertain<DateRange>>(null);
    const [page, setPage] = useState(1);
    const [repaymentLoan, setRepaymentLoan] = useState<LoanItem | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirectTo=/tools/expense-manager');
        }
    }, [status, router]);

    const range = useMemo(() => {
        if (timeframe === 'all' || !dateRange) return null;

        return { from: dateRange?.from?.toISOString(), to: dateRange?.to?.toISOString() };
    }, [timeframe, dateRange]);

    const entriesEndpoint = useMemo(() => {
        const params = generateQueryParams({
            page: String(page),
            limit: timeframe === 'all' ? '8' : '50',
            type: filter !== 'all' ? filter : '',
            search: query.trim() ? query.trim() : '',
            from: dateRange?.from && range ? range.from : '',
            to: dateRange?.to && range ? range.to : '',
        });

        return `/api/tools/expenses/entries${params}` as const;
    }, [dateRange?.from, dateRange?.to, filter, page, query, timeframe, range]);

    const { data: summary, isLoading: summaryLoading } = useApiQuery<ExpenseSummary>(
        '/api/tools/expenses/summary',
        { enabled: status === 'authenticated', queryKey: ['expense-summary'] }
    );

    const { data: currencyData } = useApiQuery<CurrencyResponse>(
        '/api/tools/expenses/currency',
        {
            enabled: status === 'authenticated',
            queryKey: ['expense-currency'],
        }
    );

    const { data: entriesData, isLoading: entriesLoading } = useApiQuery<PaginatedExpenses>(
        entriesEndpoint,
        { enabled: status === 'authenticated', queryKey: ['expense-entries', entriesEndpoint] }
    );

    const { data: loansData, isLoading: loansLoading } = useApiQuery<LoanItem[]>(
        '/api/tools/expenses/loans',
        { enabled: status === 'authenticated', queryKey: ['expense-loans'] }
    );

    const currency = currencyData?.preferred_currency || summary?.currency || 'BDT';
    const entries = entriesData?.entries || [];
    const totalPages = entriesData?.totalPages || 1;
    const loans = loansData || [];

    const borrowedLoans = useMemo(() => {
        return loans.filter((loan) => loan.type === 'borrowed');
    }, [loans]);

    const lentLoans = useMemo(() => {
        return loans.filter((loan) => loan.type === 'lent');
    }, [loans]);

    const money = (value: number) => formatMoney(value, currency);

    if (status === 'loading' || (summaryLoading && entriesLoading && loansLoading)) {
        return <ExpensePageSkeleton />;
    }

    if (!session?.user) return null;

    return (
        <div className="space-y-8">
            <Alert className="mb-8 border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900 dark:text-yellow-50 select-none">
                <AlertTriangle />
                <AlertTitle>Experimental Feature (Under Development)</AlertTitle>
                <AlertDescription className="inline">
                    This feature is experimental and still under active development. You may
                    encounter bugs or incomplete functionality.
                    <br />
                    If you notice any issues or have suggestions, please{' '}
                    <Link
                        className="border-b border-b-yellow-800 hover:text-primary dark:border-b-yellow-50 hover:dark:border-b-primary hover:dark:text-primary"
                        href="/contact#send-message"
                    >
                        send your feedback
                    </Link>
                    .
                </AlertDescription>
            </Alert>
            <div className="space-y-3">
                <TitleWithShare
                    description="Track income, expenses, borrowed loans, lent loans, and cash in hand."
                    route="/tools/expense-manager"
                    title="Expense Manager"
                />

                <div className="flex gap-2 justify-end">
                    <Button onClick={() => setIsAddOpen(true)}>
                        <Plus className="size-4" />
                        Add Entry
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/settings">Account Settings</Link>
                    </Button>
                </div>
            </div>
            <CurrencyCard currencyData={currencyData} />
            <SummaryCards money={money} summary={summary} />
            <EntriesSection
                dateRange={dateRange}
                entries={entries}
                filter={filter}
                money={money}
                page={page}
                query={query}
                setDateRange={setDateRange}
                setFilter={setFilter}
                setPage={setPage}
                setQuery={setQuery}
                setTimeframe={(value) => {
                    setPage(() => 1);
                    setTimeframe(value);
                }}
                timeframe={timeframe}
                totalPages={totalPages}
            />
            <LoansSection
                borrowedLoans={borrowedLoans}
                lentLoans={lentLoans}
                money={money}
                onAddPayment={setRepaymentLoan}
            />
            <AddEntryDialog
                currency={currency}
                isAddOpen={isAddOpen}
                setIsAddOpen={setIsAddOpen}
            />
            <RepaymentDialog
                currency={currency}
                loan={repaymentLoan}
                money={money}
                setLoan={setRepaymentLoan}
            />
        </div>
    );
}
