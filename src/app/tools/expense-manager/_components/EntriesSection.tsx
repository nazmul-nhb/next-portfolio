import { Calendar, List, Search, Wallet2, X } from 'lucide-react';
import { Chronos } from 'nhb-toolbox';
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { confirmToast } from '@/components/misc/confirm';
import EmptyData from '@/components/misc/empty-data';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { deleteFromCloudinary } from '@/lib/actions/cloudinary';
import { useApiMutation } from '@/lib/hooks/use-api';
import type { Uncertain } from '@/types';
import type { ExpenseItem } from '@/types/expenses';
import ExpenseTable from './ExpenseTable';

type EntriesSectionProps = {
    entries: ExpenseItem[];
    query: string;
    filter: 'all' | 'income' | 'expense';
    timeframe: 'all' | 'range';
    dateRange: Uncertain<DateRange>;
    page: number;
    totalPages: number;
    money: (value: number) => string;
    setQuery: (value: string) => void;
    setFilter: (value: 'all' | 'income' | 'expense') => void;
    setTimeframe: (value: 'all' | 'range') => void;
    setDateRange: (value: Uncertain<DateRange>) => void;
    setPage: Dispatch<SetStateAction<number>>;
};

export function EntriesSection({
    entries,
    filter,
    money,
    page,
    query,
    dateRange,
    setFilter,
    setPage,
    setQuery,
    setDateRange,
    setTimeframe,
    timeframe,
    totalPages,
}: EntriesSectionProps) {
    const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);

    const { mutate: deleteEntry, isPending: deletingEntry } = useApiMutation<
        { receipt_urls?: string[] },
        null
    >(`/api/tools/expenses/entries?id=${deletingEntryId}`, 'DELETE', {
        invalidateKeys: ['expense-summary', 'expense-entries'],
    });

    const rangeLabel = useMemo(() => {
        if (timeframe === 'all' || !dateRange) return null;
        const start = new Chronos(dateRange.from);
        const end = new Chronos(dateRange.to);
        return `${start.format('mmm DD')} – ${end.format('mmm DD, YYYY')}`;
    }, [timeframe, dateRange]);

    // Calculate totals
    const totals = useMemo(() => {
        let income = 0;
        let expense = 0;
        for (const entry of entries) {
            if (entry.type === 'income') income += entry.amount;
            else expense += entry.amount;
        }
        return { income, expense, net: income - expense };
    }, [entries]);

    const handleDeleteEntry = (id: number) => {
        setDeletingEntryId(id);
        confirmToast({
            title: 'Delete this entry?',
            description: 'This action cannot be undone.',
            confirmText: 'Delete',
            isLoading: deletingEntry,
            onConfirm: () => {
                deleteEntry(null, {
                    onSuccess: async (response) => {
                        const urls = response.data?.receipt_urls || [];
                        if (urls.length > 0) {
                            await Promise.allSettled(
                                urls.map((url: string) => deleteFromCloudinary(url))
                            );
                        }
                    },
                    onSettled: () => setDeletingEntryId(null),
                });
            },
        });
    };

    return (
        <section className="space-y-4">
            <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold">Income & Expense Entries</h2>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9 sm:w-64"
                                onChange={(e) => {
                                    setPage(1);
                                    setQuery(e.target.value);
                                }}
                                placeholder="Search entries..."
                                value={query}
                            />
                        </div>
                        <Select
                            onValueChange={(value: 'all' | 'income' | 'expense') => {
                                setFilter(value);
                                setPage(1);
                            }}
                            value={filter}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-wrap justify-between gap-2">
                    {/* Timeframe Toggle */}
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => {
                                setPage(1);
                                setTimeframe('all');
                                setDateRange(null);
                            }}
                            variant={timeframe === 'all' ? 'default' : 'outline'}
                        >
                            <List className="size-4" />
                            All Entries
                        </Button>
                        <Button
                            onClick={() => {
                                setPage(1);
                                setTimeframe('range');
                            }}
                            variant={timeframe === 'range' ? 'default' : 'outline'}
                        >
                            <Calendar className="size-4" />
                            Date Range
                        </Button>
                    </div>

                    {/* Date Range Picker */}
                    {timeframe === 'range' && (
                        <div className="flex gap-3 items-center">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        className="justify-start"
                                        id="date-range"
                                        variant="outline"
                                    >
                                        <Calendar className="size-4" />
                                        {dateRange ? rangeLabel : 'Pick dates'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-auto p-0">
                                    <CalendarPicker
                                        captionLayout="label"
                                        mode="range"
                                        navLayout="after"
                                        numberOfMonths={1}
                                        onSelect={(range) => {
                                            setDateRange(range);
                                            setPage(1);
                                        }}
                                        selected={dateRange ? dateRange : undefined}
                                    />
                                </PopoverContent>
                            </Popover>

                            {dateRange && (
                                <Button
                                    onClick={() => {
                                        setDateRange(null);
                                        setPage(1);
                                    }}
                                    size="default"
                                    variant="outline"
                                >
                                    <X className="size-4" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {entries.length === 0 ? (
                <EmptyData
                    description="No entries found for this filter."
                    Icon={Wallet2}
                    title="No data"
                />
            ) : (
                <div className="space-y-4">
                    {/* Totals Summary */}
                    {timeframe === 'range' && (
                        <div className="rounded-lg border border-border bg-muted/50 p-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Income</p>
                                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                        +{money(totals.income)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Expense</p>
                                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                                        -{money(totals.expense)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Net</p>
                                    <p
                                        className={`text-lg font-semibold ${
                                            totals.net >= 0
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }`}
                                    >
                                        {totals.net >= 0 ? '+' : ''}
                                        {money(totals.net)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <ExpenseTable
                            deletingEntry={deletingEntry}
                            deletingEntryId={deletingEntryId}
                            entries={entries}
                            handleDeleteEntry={handleDeleteEntry}
                            money={money}
                        />

                        <div className="flex items-center justify-between pt-1">
                            <p className="text-xs text-muted-foreground">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    disabled={page <= 1}
                                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                    size="sm"
                                    variant="outline"
                                >
                                    Previous
                                </Button>
                                <Button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((prev) => prev + 1)}
                                    size="sm"
                                    variant="outline"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
