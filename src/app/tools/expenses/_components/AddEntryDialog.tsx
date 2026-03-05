'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { getCurrentDateTimeLocal, toMinorUnits } from '@/lib/expenses';
import { useApiMutation } from '@/lib/hooks/use-api';
import { AddExpenseEntryFormSchema } from '@/lib/zod-schema/expenses';
import { ReceiptGallery } from './ReceiptGallery';
import type { AddEntryFormData } from './types';

type AddEntryDialogProps = {
    currency: string;
    isAddOpen: boolean;
    setIsAddOpen: Dispatch<SetStateAction<boolean>>;
};

export function AddEntryDialog({ currency, isAddOpen, setIsAddOpen }: AddEntryDialogProps) {
    const [uploadingReceipts, setUploadingReceipts] = useState(false);

    const [receiptInputKey, setReceiptInputKey] = useState(0);

    const form = useForm<AddEntryFormData>({
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

    const addEntryKind = form.watch('entry_kind');
    const receiptFiles = form.watch('receipt_files') || [];

    const receiptPreviewUrls = useMemo(() => {
        return receiptFiles.map((file) => URL.createObjectURL(file));
    }, [receiptFiles]);

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

    const resetAddForm = () => {
        form.reset({
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

    useEffect(() => {
        return () => {
            for (const url of receiptPreviewUrls) {
                URL.revokeObjectURL(url);
            }
        };
    }, [receiptPreviewUrls]);

    return (
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

                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(handleCreate)}>
                        <FormField
                            control={form.control}
                            name="entry_kind"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Entry Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                control={form.control}
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
                                control={form.control}
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
                                control={form.control}
                                name="entry_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {addEntryKind.includes('loan')
                                                ? 'Start Date & Time'
                                                : 'Entry Date & Time'}
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {addEntryKind.includes('loan') && (
                                <Fragment>
                                    <FormField
                                        control={form.control}
                                        name="counterparty"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Counterparty (optional)</FormLabel>
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
                                        control={form.control}
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
                                </Fragment>
                            )}

                            <FormField
                                control={form.control}
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

                            <FormField
                                control={form.control}
                                name="receipt_files"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>Receipts / Proofs (optional)</FormLabel>
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
                                        {receiptPreviewUrls.length > 0 && (
                                            <ReceiptGallery
                                                maxPreview={12}
                                                previewOnly
                                                receipts={receiptPreviewUrls}
                                            />
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                disabled={creatingEntry || creatingLoan || uploadingReceipts}
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
    );
}
