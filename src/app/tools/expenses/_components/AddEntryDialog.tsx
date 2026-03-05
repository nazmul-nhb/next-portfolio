'use client';

import { useEffect, useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
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
import { ReceiptGallery } from './ReceiptGallery';
import type { AddEntryFormData } from './types';

type AddEntryDialogProps = {
    open: boolean;
    currency: string;
    entryKind: AddEntryFormData['entry_kind'];
    receiptFiles: File[];
    receiptInputKey: number;
    creatingEntry: boolean;
    creatingLoan: boolean;
    uploadingReceipts: boolean;
    form: UseFormReturn<AddEntryFormData>;
    onSubmit: (values: AddEntryFormData) => void;
    onOpenChange: (open: boolean) => void;
    onCancel: () => void;
};

export function AddEntryDialog({
    creatingEntry,
    creatingLoan,
    currency,
    entryKind,
    form,
    onCancel,
    onOpenChange,
    onSubmit,
    open,
    receiptFiles,
    receiptInputKey,
    uploadingReceipts,
}: AddEntryDialogProps) {
    const receiptPreviewUrls = useMemo(() => {
        return receiptFiles.map((file) => URL.createObjectURL(file));
    }, [receiptFiles]);

    useEffect(() => {
        return () => {
            for (const url of receiptPreviewUrls) {
                URL.revokeObjectURL(url);
            }
        };
    }, [receiptPreviewUrls]);

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Entry</DialogTitle>
                    <DialogDescription>
                        Choose entry type and fill the required details.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
                                                    entryKind.includes('loan')
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
                                            {entryKind.includes('loan')
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

                            {entryKind.includes('loan') && (
                                <>
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
                                </>
                            )}

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>
                                            {entryKind.includes('loan')
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
                            <Button onClick={onCancel} type="button" variant="outline">
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
