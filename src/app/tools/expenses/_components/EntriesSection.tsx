import { Search } from 'lucide-react';
import { formatDate } from 'nhb-toolbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { ExpenseItem } from '@/types/expenses';
import { ReceiptGallery } from './ReceiptGallery';

type EntriesSectionProps = {
    entries: ExpenseItem[];
    query: string;
    filter: 'all' | 'income' | 'expense';
    page: number;
    totalPages: number;
    deletingEntry: boolean;
    deletingEntryId: number | null;
    money: (value: number) => string;
    setQuery: (value: string) => void;
    setFilter: (value: 'all' | 'income' | 'expense') => void;
    setPage: (updater: (prev: number) => number) => void;
    onDeleteEntry: (id: number) => void;
};

export function EntriesSection({
    deletingEntry,
    deletingEntryId,
    entries,
    filter,
    money,
    onDeleteEntry,
    page,
    query,
    setFilter,
    setPage,
    setQuery,
    totalPages,
}: EntriesSectionProps) {
    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold">Income & Expense Entries</h2>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9 sm:w-64"
                            onChange={(e) => {
                                setPage(() => 1);
                                setQuery(e.target.value);
                            }}
                            placeholder="Search entries..."
                            value={query}
                        />
                    </div>
                    <Select
                        onValueChange={(value: 'all' | 'income' | 'expense') => {
                            setFilter(value);
                            setPage(() => 1);
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

            {entries.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        No entries found for this filter.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    <div className="hidden overflow-x-auto rounded-xl border border-border/60 bg-card md:block">
                        <table className="w-full min-w-190 text-sm">
                            <thead className="bg-muted/40 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Title</th>
                                    <th className="px-4 py-3 text-left font-medium">Type</th>
                                    <th className="px-4 py-3 text-left font-medium">Amount</th>
                                    <th className="px-4 py-3 text-left font-medium">Date</th>
                                    <th className="px-4 py-3 text-left font-medium">Proofs</th>
                                    <th className="px-4 py-3 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry) => (
                                    <tr className="border-t border-border/50" key={entry.id}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{entry.title}</p>
                                            {entry.description && (
                                                <p className="line-clamp-1 text-xs text-muted-foreground">
                                                    {entry.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 capitalize">{entry.type}</td>
                                        <td
                                            className={`px-4 py-3 font-semibold ${
                                                entry.type === 'income'
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}
                                        >
                                            {entry.type === 'income' ? '+' : '-'}
                                            {money(entry.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {formatDate({
                                                date: entry.entry_date,
                                                format: 'mmm DD, yyyy hh:mm a',
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {entry.receipts.length > 0 ? (
                                                <ReceiptGallery
                                                    maxPreview={4}
                                                    receipts={entry.receipts.map(
                                                        (item) => item.image_url
                                                    )}
                                                />
                                            ) : (
                                                'No proofs'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                disabled={
                                                    deletingEntry &&
                                                    deletingEntryId === entry.id
                                                }
                                                onClick={() => onDeleteEntry(entry.id)}
                                                size="sm"
                                                variant="ghost"
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid gap-3 md:hidden">
                        {entries.map((entry) => (
                            <Card key={entry.id}>
                                <CardContent className="space-y-3 pt-5 pb-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-medium">{entry.title}</p>
                                            {entry.description && (
                                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                                    {entry.description}
                                                </p>
                                            )}
                                        </div>
                                        <p
                                            className={`text-sm font-semibold ${
                                                entry.type === 'income'
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}
                                        >
                                            {entry.type === 'income' ? '+' : '-'}
                                            {money(entry.amount)}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="capitalize">{entry.type}</span>
                                        <span>
                                            {formatDate({
                                                date: entry.entry_date,
                                                format: 'mmm DD, yyyy hh:mm a',
                                            })}
                                        </span>
                                    </div>
                                    {entry.receipts.length > 0 && (
                                        <ReceiptGallery
                                            maxPreview={8}
                                            receipts={entry.receipts.map(
                                                (item) => item.image_url
                                            )}
                                        />
                                    )}
                                    <div className="flex justify-end">
                                        <Button
                                            disabled={
                                                deletingEntry && deletingEntryId === entry.id
                                            }
                                            onClick={() => onDeleteEntry(entry.id)}
                                            size="sm"
                                            variant="outline"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

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
            )}
        </section>
    );
}
