'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
    CalendarDays,
    HandCoins,
    Landmark,
    Plus,
    ReceiptText,
    Search,
    Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatDate } from 'nhb-toolbox';
import { CURRENCY_CODES } from 'nhb-toolbox/constants';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type z from 'zod';
import { confirmToast } from '@/components/misc/confirm';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    type CloudinaryResponse,
    deleteFromCloudinary,
    uploadMultipleToCloudinary,
} from '@/lib/actions/cloudinary';
import { formatMoney, toMinorUnits } from '@/lib/expenses';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { buildCloudinaryUrl } from '@/lib/utils';
import { AddExpenseEntryFormSchema, LoanRepaymentFormSchema } from '@/lib/zod-schema/expenses';
import type { ExpenseSummary, LoanItem, PaginatedExpenses } from '@/types/expenses';

type CurrencyResponse = {
    preferred_currency: string;
};

type AddEntryFormData = z.infer<typeof AddExpenseEntryFormSchema>;
type RepaymentFormData = z.infer<typeof LoanRepaymentFormSchema>;

export function ExpensesClient() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [page, setPage] = useState(1);
    const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);
    const [repaymentLoan, setRepaymentLoan] = useState<LoanItem | null>(null);
    const [loanActionId, setLoanActionId] = useState<number | null>(null);
    const [currencyDraft, setCurrencyDraft] = useState('USD');
    const [receiptInputKey, setReceiptInputKey] = useState(0);
    const [uploadingReceipts, setUploadingReceipts] = useState(false);

    const addEntryForm = useForm<AddEntryFormData>({
        resolver: zodResolver(AddExpenseEntryFormSchema),
        defaultValues: {
            entry_kind: 'expense',
            title: '',
            amount_input: '',
            description: '',
            counterparty: '',
            due_date: '',
            entry_date: formatDate({ format: 'DD/MM/YYYY' }),
            receipt_files: [],
        },
    });

    const repaymentForm = useForm<RepaymentFormData>({
        resolver: zodResolver(LoanRepaymentFormSchema),
        defaultValues: {
            amount_input: '',
            payment_date: '',
            note: '',
        },
    });

    const addEntryKind = addEntryForm.watch('entry_kind');
    const receiptFiles = addEntryForm.watch('receipt_files') || [];

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirectTo=/tools/expenses');
        }
    }, [status, router]);

    useEffect(() => {
        if (addEntryKind !== 'expense') {
            addEntryForm.setValue('receipt_files', []);
            setReceiptInputKey((prev) => prev + 1);
        }
    }, [addEntryKind, addEntryForm]);

    const entriesEndpoint = useMemo(() => {
        const params = new URLSearchParams({
            page: String(page),
            limit: '8',
        });

        if (filter !== 'all') params.set('type', filter);
        if (query.trim()) params.set('search', query.trim());

        return `/api/tools/expenses/entries?${params.toString()}` as `/${string}`;
    }, [filter, page, query]);

    const { data: summary, isLoading: summaryLoading } = useApiQuery<ExpenseSummary>(
        '/api/tools/expenses/summary',
        {
            enabled: status === 'authenticated',
            queryKey: ['expense-summary'],
        }
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

    const borrowedLoans = useMemo(
        () => loans.filter((loan) => loan.type === 'borrowed'),
        [loans]
    );
    const lentLoans = useMemo(() => loans.filter((loan) => loan.type === 'lent'), [loans]);

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
        successMessage: 'Entry added successfully!',
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
        { status?: 'active' | 'settled' }
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

    const money = (value: number) => formatMoney(value, currency);

    const resetAddForm = () => {
        addEntryForm.reset({
            entry_kind: 'expense',
            title: '',
            amount_input: '',
            description: '',
            counterparty: '',
            due_date: '',
            entry_date: '',
            receipt_files: [],
        });
        setReceiptInputKey((prev) => prev + 1);
    };

    const handleCreate = async (values: AddEntryFormData) => {
        const amountMinor = toMinorUnits(values.amount_input);
        const description = values.description?.trim() || undefined;
        const entryDate = values.entry_date
            ? new Date(values.entry_date).toISOString()
            : undefined;

        if (values.entry_kind === 'income' || values.entry_kind === 'expense') {
            let uploaded: CloudinaryResponse[] = [];

            try {
                if (
                    values.entry_kind === 'expense' &&
                    (values.receipt_files?.length || 0) > 0
                ) {
                    setUploadingReceipts(true);
                    uploaded = await uploadMultipleToCloudinary(
                        values.receipt_files || [],
                        'expense-receipts'
                    );
                }

                createEntry(
                    {
                        title: values.title.trim(),
                        amount: amountMinor,
                        type: values.entry_kind,
                        description,
                        entry_date: entryDate,
                        receipt_urls: uploaded.map((item) => item.url),
                    },
                    {
                        onSuccess: () => {
                            setIsAddOpen(false);
                            resetAddForm();
                        },
                        onError: async () => {
                            if (uploaded.length > 0) {
                                await Promise.allSettled(
                                    uploaded.map((item) => deleteFromCloudinary(item.public_id))
                                );
                            }
                        },
                        onSettled: () => setUploadingReceipts(false),
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
                title: values.title.trim(),
                type: values.entry_kind === 'loan_borrowed' ? 'borrowed' : 'lent',
                principal_amount: amountMinor,
                counterparty: values.counterparty?.trim() || undefined,
                notes: description,
                due_date: values.due_date ? new Date(values.due_date).toISOString() : undefined,
                start_date: entryDate,
            },
            {
                onSuccess: () => {
                    toast.success('Loan added successfully!');
                    setIsAddOpen(false);
                    resetAddForm();
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
                    onSettled: () => setDeletingEntryId(null),
                });
            },
        });
    };

    const handleAddPayment = (values: RepaymentFormData) => {
        if (!repaymentLoan) return;

        addRepayment(
            {
                amount: toMinorUnits(values.amount_input),
                note: values.note?.trim() || undefined,
                payment_date: values.payment_date
                    ? new Date(values.payment_date).toISOString()
                    : undefined,
            },
            {
                onSuccess: () => {
                    toast.success('Repayment added successfully!');
                    setRepaymentLoan(null);
                    repaymentForm.reset({
                        amount_input: '',
                        payment_date: '',
                        note: '',
                    });
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
            onConfirm: () => updateLoan({ status: 'settled' }),
            isLoading: updatingLoan,
        });
    };

    const handleDeleteLoan = (loan: LoanItem) => {
        setLoanActionId(loan.id);
        confirmToast({
            title: `Delete "${loan.title}"?`,
            description: 'All repayment history for this loan will be deleted.',
            confirmText: 'Delete',
            onConfirm: () => deleteLoan(null),
            isLoading: deletingLoan,
        });
    };

    const handleSaveCurrency = () => {
        if (!currencyDraft || currencyDraft === currencyData?.preferred_currency) return;
        updateCurrency({ preferred_currency: currencyDraft });
    };

    if (status === 'loading' || (summaryLoading && entriesLoading && loansLoading)) {
        return (
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
        );
    }

    if (!session?.user) return null;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Expense Manager</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
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
                    <Select onValueChange={setCurrencyDraft} value={currencyDraft}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                            {CURRENCY_CODES.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        disabled={
                            updatingCurrency ||
                            currencyDraft === currencyData?.preferred_currency
                        }
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
                                        <th className="px-4 py-3 text-left font-medium">
                                            Title
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Receipts
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((entry) => (
                                        <tr
                                            className="border-t border-border/50"
                                            key={entry.id}
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{entry.title}</p>
                                                {entry.description && (
                                                    <p className="line-clamp-1 text-xs text-muted-foreground">
                                                        {entry.description}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 capitalize">
                                                {entry.type}
                                            </td>
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
                                                    disabled={
                                                        deletingEntry &&
                                                        deletingEntryId === entry.id
                                                    }
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
                                                    format: 'mmm DD, yyyy',
                                                })}
                                            </span>
                                        </div>
                                        {entry.receipts.length > 0 && (
                                            <div className="flex gap-2 overflow-x-auto pb-1">
                                                {entry.receipts.slice(0, 4).map((receipt) => (
                                                    <a
                                                        className="shrink-0"
                                                        href={buildCloudinaryUrl(
                                                            receipt.image_url
                                                        )}
                                                        key={receipt.id}
                                                        rel="noreferrer"
                                                        target="_blank"
                                                    >
                                                        {/* biome-ignore lint/performance/noImgElement: thumbnail preview */}
                                                        <img
                                                            alt="Receipt"
                                                            className="h-14 w-14 rounded-md border object-cover"
                                                            src={buildCloudinaryUrl(
                                                                receipt.image_url
                                                            )}
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex justify-end">
                                            <Button
                                                disabled={
                                                    deletingEntry &&
                                                    deletingEntryId === entry.id
                                                }
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
                    money={money}
                    onAddPayment={setRepaymentLoan}
                    title="Borrowed Loans"
                    type="borrowed"
                    values={borrowedLoans}
                />
                <LoanSection
                    emptyMessage="No lent loans yet."
                    handleDeleteLoan={handleDeleteLoan}
                    handleSettleLoan={handleSettleLoan}
                    money={money}
                    onAddPayment={setRepaymentLoan}
                    title="Lent Loans"
                    type="lent"
                    values={lentLoans}
                />
            </section>

            <Dialog
                onOpenChange={(open) => {
                    setIsAddOpen(open);
                    if (!open) resetAddForm();
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

                    <Form {...addEntryForm}>
                        <form
                            className="space-y-4"
                            onSubmit={addEntryForm.handleSubmit(handleCreate)}
                        >
                            <FormField
                                control={addEntryForm.control}
                                name="entry_kind"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Entry Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select entry type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="income">
                                                    Income (Money In)
                                                </SelectItem>
                                                <SelectItem value="expense">
                                                    Expense (Money Out)
                                                </SelectItem>
                                                <SelectItem value="loan_borrowed">
                                                    Loan Borrowed (Liability)
                                                </SelectItem>
                                                <SelectItem value="loan_lent">
                                                    Loan Lent (Asset)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={addEntryForm.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2">
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={
                                                        addEntryKind.includes('loan')
                                                            ? 'Loan purpose/title'
                                                            : 'Entry title'
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={addEntryForm.control}
                                    name="amount_input"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount ({currency})</FormLabel>
                                            <FormControl>
                                                <Input
                                                    min={0}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    type="number"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={addEntryForm.control}
                                    name="entry_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {addEntryKind.includes('loan')
                                                    ? 'Start Date'
                                                    : 'Entry Date'}
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {addEntryKind.includes('loan') && (
                                    <>
                                        <FormField
                                            control={addEntryForm.control}
                                            name="counterparty"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Counterparty (optional)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Person or organization"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={addEntryForm.control}
                                            name="due_date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Due Date (optional)</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                )}

                                <FormField
                                    control={addEntryForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2">
                                            <FormLabel>
                                                {addEntryKind.includes('loan')
                                                    ? 'Notes'
                                                    : 'Description'}
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="min-h-24"
                                                    placeholder="Optional details..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {addEntryKind === 'expense' && (
                                    <FormField
                                        control={addEntryForm.control}
                                        name="receipt_files"
                                        render={({ field }) => (
                                            <FormItem className="sm:col-span-2">
                                                <FormLabel>Receipts (optional)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        accept="image/*"
                                                        key={receiptInputKey}
                                                        multiple
                                                        onChange={(e) => {
                                                            const files = Array.from(
                                                                e.target.files || []
                                                            );
                                                            field.onChange(files);
                                                        }}
                                                        type="file"
                                                    />
                                                </FormControl>
                                                {!!receiptFiles.length && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {receiptFiles.length} file(s) selected
                                                    </p>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    onClick={() => {
                                        setIsAddOpen(false);
                                        resetAddForm();
                                    }}
                                    type="button"
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={
                                        creatingEntry || creatingLoan || uploadingReceipts
                                    }
                                    loading={creatingEntry || creatingLoan || uploadingReceipts}
                                    type="submit"
                                >
                                    Save Entry
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog
                onOpenChange={(open) => {
                    if (!open) {
                        setRepaymentLoan(null);
                        repaymentForm.reset({
                            amount_input: '',
                            payment_date: '',
                            note: '',
                        });
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

                    <Form {...repaymentForm}>
                        <form
                            className="space-y-4"
                            onSubmit={repaymentForm.handleSubmit(handleAddPayment)}
                        >
                            <FormField
                                control={repaymentForm.control}
                                name="amount_input"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount ({currency})</FormLabel>
                                        <FormControl>
                                            <Input
                                                min={0}
                                                placeholder="0.00"
                                                step="0.01"
                                                type="number"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={repaymentForm.control}
                                name="payment_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Date (optional)</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={repaymentForm.control}
                                name="note"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Note (optional)</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    onClick={() => setRepaymentLoan(null)}
                                    type="button"
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={addingRepayment}
                                    loading={addingRepayment}
                                    type="submit"
                                >
                                    Add Payment
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
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
                                    <InfoRow
                                        label="Principal"
                                        value={money(loan.principal_amount)}
                                    />
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
