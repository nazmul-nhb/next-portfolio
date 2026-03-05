'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { confirmToast } from '@/components/misc/confirm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    type CloudinaryResponse,
    deleteFromCloudinary,
    uploadMultipleToCloudinary,
} from '@/lib/actions/cloudinary';
import { formatMoney, getCurrentDateTimeLocal, toMinorUnits } from '@/lib/expenses';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { AddExpenseEntryFormSchema, LoanRepaymentFormSchema } from '@/lib/zod-schema/expenses';
import type { ExpenseSummary, LoanItem, PaginatedExpenses } from '@/types/expenses';
import { AddEntryDialog } from './AddEntryDialog';
import { CurrencyPreferenceCard } from './CurrencyPreferenceCard';
import { EntriesSection } from './EntriesSection';
import { LoansSection } from './LoansSection';
import { RepaymentDialog } from './RepaymentDialog';
import { SummaryCards } from './SummaryCards';
import type { AddEntryFormData, RepaymentFormData } from './types';

type CurrencyResponse = {
    preferred_currency: string;
};

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
    const [currencyDraft, setCurrencyDraft] = useState('BDT');
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
            entry_date: getCurrentDateTimeLocal(),
            receipt_files: [],
        },
    });

    const repaymentForm = useForm<RepaymentFormData>({
        resolver: zodResolver(LoanRepaymentFormSchema),
        defaultValues: {
            amount_input: '',
            payment_date: getCurrentDateTimeLocal(),
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
            receipt_urls?: string[];
        }
    >('/api/tools/expenses/loans', 'POST', {
        successMessage: 'Loan added successfully!',
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

    const { mutate: deleteLoan, isPending: deletingLoan } = useApiMutation<
        { receipt_urls?: string[] },
        null
    >(`/api/tools/expenses/loans/${loanActionId}` as `/${string}`, 'DELETE', {
        invalidateKeys: ['expense-summary', 'expense-loans'],
    });

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
            entry_date: getCurrentDateTimeLocal(),
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
        const dueDate = values.due_date ? new Date(values.due_date).toISOString() : undefined;
        let uploaded: CloudinaryResponse[] = [];

        try {
            if ((values.receipt_files?.length || 0) > 0) {
                setUploadingReceipts(true);
                uploaded = await uploadMultipleToCloudinary(
                    values.receipt_files || [],
                    'transaction-receipts'
                );
            }

            if (values.entry_kind === 'income' || values.entry_kind === 'expense') {
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
                return;
            }

            createLoan(
                {
                    title: values.title.trim(),
                    type: values.entry_kind === 'loan_borrowed' ? 'borrowed' : 'lent',
                    principal_amount: amountMinor,
                    counterparty: values.counterparty?.trim() || undefined,
                    notes: description,
                    due_date: dueDate,
                    start_date: entryDate,
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
                    setRepaymentLoan(null);
                    repaymentForm.reset({
                        amount_input: '',
                        payment_date: getCurrentDateTimeLocal(),
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
            onConfirm: () => {
                deleteLoan(null, {
                    onSuccess: async (response) => {
                        const urls = response.data?.receipt_urls || [];
                        if (urls.length > 0) {
                            await Promise.allSettled(
                                urls.map((url: string) => deleteFromCloudinary(url))
                            );
                        }
                    },
                });
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

            <CurrencyPreferenceCard
                currencyDraft={currencyDraft}
                onSave={handleSaveCurrency}
                preferredCurrency={currencyData?.preferred_currency}
                setCurrencyDraft={setCurrencyDraft}
                updatingCurrency={updatingCurrency}
            />

            <SummaryCards money={money} summary={summary} />

            <EntriesSection
                deletingEntry={deletingEntry}
                deletingEntryId={deletingEntryId}
                entries={entries}
                filter={filter}
                money={money}
                onDeleteEntry={handleDeleteEntry}
                page={page}
                query={query}
                setFilter={setFilter}
                setPage={setPage}
                setQuery={setQuery}
                totalPages={totalPages}
            />

            <LoansSection
                borrowedLoans={borrowedLoans}
                lentLoans={lentLoans}
                money={money}
                onAddPayment={setRepaymentLoan}
                onDeleteLoan={handleDeleteLoan}
                onSettleLoan={handleSettleLoan}
            />

            <AddEntryDialog
                creatingEntry={creatingEntry}
                creatingLoan={creatingLoan}
                currency={currency}
                entryKind={addEntryKind}
                form={addEntryForm}
                onCancel={() => {
                    setIsAddOpen(false);
                    resetAddForm();
                }}
                onOpenChange={(open) => {
                    setIsAddOpen(open);
                    if (!open) resetAddForm();
                }}
                onSubmit={handleCreate}
                open={isAddOpen}
                receiptFiles={receiptFiles}
                receiptInputKey={receiptInputKey}
                uploadingReceipts={uploadingReceipts}
            />

            <RepaymentDialog
                addingRepayment={addingRepayment}
                currency={currency}
                form={repaymentForm}
                loan={repaymentLoan}
                money={money}
                onOpenChange={(open) => {
                    if (!open) {
                        setRepaymentLoan(null);
                        repaymentForm.reset({
                            amount_input: '',
                            payment_date: getCurrentDateTimeLocal(),
                            note: '',
                        });
                    }
                }}
                onSubmit={handleAddPayment}
                open={!!repaymentLoan}
            />
        </div>
    );
}
