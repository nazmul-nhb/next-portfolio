'use client';

import { CalendarDays, HandCoins, Landmark, Plus, ReceiptText, Search, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatDate } from 'nhb-toolbox';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { confirmToast } from '@/components/misc/confirm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    deleteFromCloudinary,
    type CloudinaryResponse,
    uploadMultipleToCloudinary,
} from '@/lib/actions/cloudinary';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { formatMoney, toMinorUnits } from '@/lib/expenses';
import { buildCloudinaryUrl } from '@/lib/utils';
import { SUPPORTED_CURRENCIES } from '@/lib/zod-schema/expenses';
import type { ExpenseSummary, LoanItem, PaginatedExpenses } from '@/types/expenses';

type EntryKind = 'income' | 'expense' | 'loan_borrowed' | 'loan_lent';

type CurrencyResponse = {
    preferred_currency: string;
};

export function ExpensesClient() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [entryKind, setEntryKind] = useState<EntryKind>('expense');
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [counterparty, setCounterparty] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [entryDate, setEntryDate] = useState('');
    const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
    const [uploadingReceipts, setUploadingReceipts] = useState(false);
    const [receiptInputKey, setReceiptInputKey] = useState(0);

    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [page, setPage] = useState(1);
    const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);

    const [repaymentLoan, setRepaymentLoan] = useState<LoanItem | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentNote, setPaymentNote] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [loanActionId, setLoanActionId] = useState<number | null>(null);

    const [currencyDraft, setCurrencyDraft] = useState('USD');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirectTo=/tools/expenses');
        }
    }, [status, router]);

    const entriesEndpoint = useMemo(() => {
        const params = new URLSearchParams({
            page: String(page),
            limit: '8',
        });

        if (filter !== 'all') {
            params.set('type', filter);
        }

        if (query.trim()) {
            params.set('search', query.trim());
        }

        return `/api/tools/expenses/entries?${params.toString()}` as `/${string}`;
    }, [filter, page, query]);

    const { data: summary, isLoading: summaryLoading } = useApiQuery<ExpenseSummary>(
        '/api/tools/expenses/summary',
        {
            enabled: status === 'authenticated',
            queryKey: ['expense-summary'],
        }
    );

    const { data: currencyData } = useApiQuery<CurrencyResponse>('/api/tools/expenses/currency', {
        enabled: status === 'authenticated',
        queryKey: ['expense-currency'],
    });

    const { data: entriesData, isLoading: entriesLoading } = useApiQuery<PaginatedExpenses>(
        entriesEndpoint,
        {
            enabled: status === 'authenticated',
            queryKey: ['expense-entries', entriesEndpoint],
        }
    );

    const { data: loansData, isLoading: loansLoading } = useApiQuery<LoanItem[]>(
        '/api/tools/expenses/loans',
        {
            enabled: status === 'authenticated',
            queryKey: ['expense-loans'],
        }
    );

    useEffect(() => {
        if (currencyData?.preferred_currency) {
            setCurrencyDraft(currencyData.preferred_currency);
        }
    }, [currencyData?.preferred_currency]);

    const currency = currencyData?.preferred_currency || summary?.currency || 'USD';
    const entries = entriesData?.entries || [];
    const totalPages = entriesData?.totalPages || 1;
    const loans = loansData || [];

    const borrowedLoans = useMemo(() => {
        return loans.filter((loan) => loan.type === 'borrowed');
    }, [loans]);

    const lentLoans = useMemo(() => {
        return loans.filter((loan) => loan.type === 'lent');
    }, [loans]);

    const { mutate: createEntry, isPending: creatingEntry } = useApiMutation<
        unknown,
        {
            title: string;
            amount: number;
            type: 'income' | 'expense';
            description?: string;
            entry_date?: string;
            receipt_urls?: string[];
        }
    >('/api/tools/expenses/entries', 'POST', {
        silentSuccessMessage: true,
        invalidateKeys: ['expense-summary', 'expense-entries'],
    });

    const { mutate: deleteEntry, isPending: deletingEntry } = useApiMutation<
        { receipt_urls?: string[] },
        null
    >(`/api/tools/expenses/entries?id=${deletingEntryId}` as `/${string}`, 'DELETE', {
        invalidateKeys: ['expense-summary', 'expense-entries'],
    });

    const { mutate: createLoan, isPending: creatingLoan } = useApiMutation<
        unknown,
        {
            title: string;
            type: 'borrowed' | 'lent';
            principal_amount: number;
            counterparty?: string;
            notes?: string;
            due_date?: string;
            start_date?: string;
        }
    >('/api/tools/expenses/loans', 'POST', {
        silentSuccessMessage: true,
        invalidateKeys: ['expense-summary', 'expense-loans'],
    });

    const { mutate: addRepayment, isPending: addingRepayment } = useApiMutation<
        unknown,
        {
            amount: number;
            note?: string;
            payment_date?: string;
        }
    >(`/api/tools/expenses/loans/${repaymentLoan?.id}/payments` as `/${string}`, 'POST', {
        invalidateKeys: ['expense-summary', 'expense-loans'],
    });

    const { mutate: updateLoan, isPending: updatingLoan } = useApiMutation<
        unknown,
        {
            status?: 'active' | 'settled';
            title?: string;
            counterparty?: string;
            notes?: string;
            due_date?: string | null;
        }
    >(`/api/tools/expenses/loans/${loanActionId}` as `/${string}`, 'PATCH', {
        invalidateKeys: ['expense-summary', 'expense-loans'],
    });

    const { mutate: deleteLoan, isPending: deletingLoan } = useApiMutation<unknown, null>(
        `/api/tools/expenses/loans/${loanActionId}` as `/${string}`,
        'DELETE',
        {
            invalidateKeys: ['expense-summary', 'expense-loans'],
        }
    );

    const { mutate: updateCurrency, isPending: updatingCurrency } = useApiMutation<
        CurrencyResponse,
        CurrencyResponse
    >('/api/tools/expenses/currency', 'PATCH', {
        successMessage: 'Currency preference updated!',
        invalidateKeys: ['expense-summary', 'expense-currency'],
    });

    const resetEntryForm = () => {
        setEntryKind('expense');
        setTitle('');
        setAmount('');
        setDescription('');
        setCounterparty('');
        setDueDate('');
        setEntryDate('');
        setReceiptFiles([]);
        setReceiptInputKey((prev) => prev + 1);
    };

    const money = (value: number) => formatMoney(value, currency);

    const handleCreate = async () => {
        const amountMinor = toMinorUnits(amount);

        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }

        if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
            toast.error('Enter a valid amount');
            return;
        }

        if (entryKind === 'income' || entryKind === 'expense') {
            let uploaded: CloudinaryResponse[] = [];

            try {
                if (entryKind === 'expense' && receiptFiles.length > 0) {
                    setUploadingReceipts(true);
                    uploaded = await uploadMultipleToCloudinary(
                        receiptFiles,
                        'expense-receipts'
                    );
                }

                createEntry(
                    {
                        title: title.trim(),
                        amount: amountMinor,
                        type: entryKind,
                        description: description.trim() || undefined,
                        entry_date: entryDate ? new Date(entryDate).toISOString() : undefined,
                        receipt_urls: uploaded.map((item) => item.url),
                    },
                    {
                        onSuccess: () => {
                            toast.success('Entry added successfully!');
                            setIsAddOpen(false);
                            resetEntryForm();
                        },
                        onError: async () => {
                            if (uploaded.length > 0) {
                                await Promise.allSettled(
                                    uploaded.map((item) => deleteFromCloudinary(item.public_id))
                                );
                            }
                        },
                        onSettled: () => {
                            setUploadingReceipts(false);
                        },
                    }
                );
            } catch {
                setUploadingReceipts(false);
                toast.error('Failed to upload receipt images');
            }

            return;
        }

        createLoan(
            {
                title: title.trim(),
                type: entryKind === 'loan_borrowed' ? 'borrowed' : 'lent',
                principal_amount: amountMinor,
                counterparty: counterparty.trim() || undefined,
                notes: description.trim() || undefined,
                due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
                start_date: entryDate ? new Date(entryDate).toISOString() : undefined,
            },
            {
                onSuccess: () => {
                    toast.success('Loan added successfully!');
                    setIsAddOpen(false);
                    resetEntryForm();
                },
            }
        );
    };

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
                    onSettled: () => {
                        setDeletingEntryId(null);
                    },
                });
            },
        });
    };

    const handleAddPayment = () => {
        if (!repaymentLoan) return;

        const paymentMinor = toMinorUnits(paymentAmount);

        if (!Number.isFinite(paymentMinor) || paymentMinor <= 0) {
            toast.error('Enter a valid payment amount');
            return;
        }

        addRepayment(
            {
                amount: paymentMinor,
                note: paymentNote.trim() || undefined,
                payment_date: paymentDate ? new Date(paymentDate).toISOString() : undefined,
            },
            {
                onSuccess: () => {
                    toast.success('Repayment added successfully!');
                    setRepaymentLoan(null);
                    setPaymentAmount('');
                    setPaymentNote('');
                    setPaymentDate('');
                },
            }
        );
    };

    const handleSettleLoan = (loan: LoanItem) => {
        setLoanActionId(loan.id);

        confirmToast({
            title: `Mark "${loan.title}" as settled?`,
            description: 'This will set remaining balance to zero.',
            confirmText: 'Settle',
            onConfirm: () => {
                updateLoan({ status: 'settled' });
            },
            isLoading: updatingLoan,
        });
    };

    const handleDeleteLoan = (loan: LoanItem) => {
        setLoanActionId(loan.id);

        confirmToast({
            title: `Delete "${loan.title}"?`,
            description: 'All repayment history for this loan will be deleted.',
            confirmText: 'Delete',
            onConfirm: () => {
                deleteLoan(null);
            },
            isLoading: deletingLoan,
        });
    };

    const handleSaveCurrency = () => {
        if (!currencyDraft || currencyDraft === currencyData?.preferred_currency) return;
        updateCurrency({ preferred_currency: currencyDraft });
    };

    if (status === 'loading' || (summaryLoading && entriesLoading && loansLoading)) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }, (_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-7 w-36 animate-pulse rounded bg-muted" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!session?.user) return null;

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 space-y-8 overflow-x-hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Expense Manager</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track income, expenses, borrowed loans, lent loans, and cash in hand.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button onClick={() => setIsAddOpen(true)}>
                        <Plus className="size-4" />
                        Add Entry
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/settings">Account Settings</Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="size-5" />
                        Currency Preference
                    </CardTitle>
                    <CardDescription>
                        Choose how all values are displayed across the expense manager.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:max-w-40"
                        onChange={(e) => setCurrencyDraft(e.target.value)}
                        value={currencyDraft}
                    >
                        {SUPPORTED_CURRENCIES.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                    <Button
                        disabled={updatingCurrency || currencyDraft === currencyData?.preferred_currency}
                        loading={updatingCurrency}
                        onClick={handleSaveCurrency}
                    >
                        Save Currency
                    </Button>
                </CardContent>
            </Card>

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

            <section className="space-y-4">
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
                        <select
                            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            onChange={(e) => {
                                setFilter(e.target.value as 'all' | 'income' | 'expense');
                                setPage(1);
                            }}
                            value={filter}
                        >
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
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
                        <div className="hidden md:block overflow-x-auto rounded-xl border border-border/60 bg-card">
                            <table className="w-full min-w-[760px] text-sm">
                                <thead className="bg-muted/40 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Title</th>
                                        <th className="px-4 py-3 text-left font-medium">Type</th>
                                        <th className="px-4 py-3 text-left font-medium">Amount</th>
                                        <th className="px-4 py-3 text-left font-medium">Date</th>
                                        <th className="px-4 py-3 text-left font-medium">Receipts</th>
                                        <th className="px-4 py-3 text-right font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((entry) => (
                                        <tr className="border-t border-border/50" key={entry.id}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{entry.title}</p>
                                                {entry.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-1">
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
                                                    format: 'mmm DD, yyyy',
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {entry.receipts.length}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    disabled={deletingEntry && deletingEntryId === entry.id}
                                                    onClick={() => handleDeleteEntry(entry.id)}
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
                                    <CardContent className="pt-5 pb-4 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-medium">{entry.title}</p>
                                                {entry.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
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
                                                    format: 'mmm DD, yyyy',
                                                })}
                                            </span>
                                        </div>

                                        {entry.receipts.length > 0 && (
                                            <div className="flex gap-2 overflow-x-auto pb-1">
                                                {entry.receipts.slice(0, 4).map((receipt) => (
                                                    <a
                                                        className="shrink-0"
                                                        href={buildCloudinaryUrl(receipt.image_url)}
                                                        key={receipt.id}
                                                        rel="noreferrer"
                                                        target="_blank"
                                                    >
                                                        {/* biome-ignore lint/performance/noImgElement: thumbnail preview */}
                                                        <img
                                                            alt="Receipt"
                                                            className="h-14 w-14 rounded-md border object-cover"
                                                            src={buildCloudinaryUrl(receipt.image_url)}
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex justify-end">
                                            <Button
                                                disabled={deletingEntry && deletingEntryId === entry.id}
                                                onClick={() => handleDeleteEntry(entry.id)}
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

            <section className="grid gap-4 lg:grid-cols-2">
                <LoanSection
                    emptyMessage="No borrowed loans yet."
                    handleDeleteLoan={handleDeleteLoan}
                    handleSettleLoan={handleSettleLoan}
                    onAddPayment={setRepaymentLoan}
                    title="Borrowed Loans"
                    type="borrowed"
                    values={borrowedLoans}
                    money={money}
                />

                <LoanSection
                    emptyMessage="No lent loans yet."
                    handleDeleteLoan={handleDeleteLoan}
                    handleSettleLoan={handleSettleLoan}
                    onAddPayment={setRepaymentLoan}
                    title="Lent Loans"
                    type="lent"
                    values={lentLoans}
                    money={money}
                />
            </section>

            <Dialog
                onOpenChange={(open) => {
                    setIsAddOpen(open);
                    if (!open) resetEntryForm();
                }}
                open={isAddOpen}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Entry</DialogTitle>
                        <DialogDescription>
                            Choose entry type and fill the required details.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="entryType">Entry Type</Label>
                            <select
                                className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                id="entryType"
                                onChange={(e) => setEntryKind(e.target.value as EntryKind)}
                                value={entryKind}
                            >
                                <option value="income">Income (Money In)</option>
                                <option value="expense">Expense (Money Out)</option>
                                <option value="loan_borrowed">Loan Borrowed (Liability)</option>
                                <option value="loan_lent">Loan Lent (Asset)</option>
                            </select>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={
                                        entryKind.includes('loan')
                                            ? 'Loan purpose/title'
                                            : 'Entry title'
                                    }
                                    value={title}
                                />
                            </div>

                            <div>
                                <Label htmlFor="amount">Amount ({currency})</Label>
                                <Input
                                    id="amount"
                                    min={0}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    type="number"
                                    value={amount}
                                />
                            </div>

                            <div>
                                <Label htmlFor="entry_date">
                                    {entryKind.includes('loan') ? 'Start Date' : 'Entry Date'}
                                </Label>
                                <Input
                                    id="entry_date"
                                    onChange={(e) => setEntryDate(e.target.value)}
                                    type="date"
                                    value={entryDate}
                                />
                            </div>

                            {entryKind.includes('loan') && (
                                <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="counterparty">Counterparty (optional)</Label>
                                        <Input
                                            id="counterparty"
                                            onChange={(e) => setCounterparty(e.target.value)}
                                            placeholder="Person or organization"
                                            value={counterparty}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="due_date">Due Date (optional)</Label>
                                        <Input
                                            id="due_date"
                                            onChange={(e) => setDueDate(e.target.value)}
                                            type="date"
                                            value={dueDate}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="sm:col-span-2">
                                <Label htmlFor="description">
                                    {entryKind.includes('loan') ? 'Notes' : 'Description'}
                                </Label>
                                <Textarea
                                    className="min-h-24"
                                    id="description"
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optional details..."
                                    value={description}
                                />
                            </div>

                            {entryKind === 'expense' && (
                                <div className="sm:col-span-2">
                                    <Label htmlFor="receipts">Receipts (optional)</Label>
                                    <Input
                                        accept="image/*"
                                        id="receipts"
                                        key={receiptInputKey}
                                        multiple
                                        onChange={(e) =>
                                            setReceiptFiles(Array.from(e.target.files || []))
                                        }
                                        type="file"
                                    />
                                    {receiptFiles.length > 0 && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {receiptFiles.length} file(s) selected
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setIsAddOpen(false)} variant="outline">
                            Cancel
                        </Button>
                        <Button
                            disabled={
                                creatingEntry || creatingLoan || uploadingReceipts || !title.trim()
                            }
                            loading={creatingEntry || creatingLoan || uploadingReceipts}
                            onClick={handleCreate}
                        >
                            Save Entry
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                onOpenChange={(open) => {
                    if (!open) {
                        setRepaymentLoan(null);
                        setPaymentAmount('');
                        setPaymentNote('');
                        setPaymentDate('');
                    }
                }}
                open={!!repaymentLoan}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Repayment</DialogTitle>
                        <DialogDescription>
                            {repaymentLoan ? (
                                <span>
                                    {repaymentLoan.title} • Remaining:{' '}
                                    {money(repaymentLoan.remaining_amount)}
                                </span>
                            ) : (
                                'Track a partial or full repayment.'
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="payment_amount">Amount ({currency})</Label>
                            <Input
                                id="payment_amount"
                                min={0}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                type="number"
                                value={paymentAmount}
                            />
                        </div>
                        <div>
                            <Label htmlFor="payment_date">Payment Date (optional)</Label>
                            <Input
                                id="payment_date"
                                onChange={(e) => setPaymentDate(e.target.value)}
                                type="date"
                                value={paymentDate}
                            />
                        </div>
                        <div>
                            <Label htmlFor="payment_note">Note (optional)</Label>
                            <Textarea
                                id="payment_note"
                                onChange={(e) => setPaymentNote(e.target.value)}
                                value={paymentNote}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setRepaymentLoan(null)} variant="outline">
                            Cancel
                        </Button>
                        <Button
                            disabled={addingRepayment}
                            loading={addingRepayment}
                            onClick={handleAddPayment}
                        >
                            Add Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

type LoanSectionProps = {
    title: string;
    type: 'borrowed' | 'lent';
    values: LoanItem[];
    emptyMessage: string;
    money: (value: number) => string;
    onAddPayment: (loan: LoanItem) => void;
    handleSettleLoan: (loan: LoanItem) => void;
    handleDeleteLoan: (loan: LoanItem) => void;
};

function LoanSection({
    emptyMessage,
    handleDeleteLoan,
    handleSettleLoan,
    money,
    onAddPayment,
    title,
    type,
    values,
}: LoanSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {type === 'borrowed' ? (
                        <Landmark className="size-5" />
                    ) : (
                        <HandCoins className="size-5" />
                    )}
                    {title}
                </CardTitle>
                <CardDescription>
                    {type === 'borrowed'
                        ? 'Money you borrowed and need to repay.'
                        : 'Money you lent out and expect back.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {values.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                ) : (
                    <div className="space-y-3">
                        {values.map((loan) => (
                            <div
                                className="rounded-lg border border-border/60 bg-muted/20 p-3"
                                key={loan.id}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-medium">{loan.title}</p>
                                        {loan.counterparty && (
                                            <p className="text-xs text-muted-foreground">
                                                {loan.counterparty}
                                            </p>
                                        )}
                                    </div>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                            loan.status === 'settled'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}
                                    >
                                        {loan.status}
                                    </span>
                                </div>

                                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                                    <InfoRow label="Principal" value={money(loan.principal_amount)} />
                                    <InfoRow label="Paid" value={money(loan.paid_amount)} />
                                    <InfoRow
                                        label="Remaining"
                                        value={money(loan.remaining_amount)}
                                    />
                                    <InfoRow
                                        label="Due"
                                        value={
                                            loan.due_date
                                                ? formatDate({
                                                      date: loan.due_date,
                                                      format: 'mmm DD, yyyy',
                                                  })
                                                : 'No due date'
                                        }
                                    />
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {loan.status !== 'settled' && (
                                        <>
                                            <Button
                                                onClick={() => onAddPayment(loan)}
                                                size="sm"
                                                variant="outline"
                                            >
                                                <ReceiptText className="size-4" />
                                                Add Repayment
                                            </Button>
                                            <Button
                                                onClick={() => handleSettleLoan(loan)}
                                                size="sm"
                                                variant="outline"
                                            >
                                                Settle
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        onClick={() => handleDeleteLoan(loan)}
                                        size="sm"
                                        variant="ghost"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <p className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" />
            <span className="font-medium text-foreground/90">{label}:</span>
            {value}
        </p>
    );
}
