'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { getCurrentDateTimeLocal, toMinorUnits } from '@/lib/expenses';
import { useApiMutation } from '@/lib/hooks/use-api';
import { LoanRepaymentFormSchema } from '@/lib/zod-schema/expenses';
import type { LoanItem } from '@/types/expenses';
import type { RepaymentFormData } from './types';

type RepaymentDialogProps = {
    currency: string;
    loan: LoanItem | null;
    money: (value: number) => string;
    setLoan: Dispatch<SetStateAction<LoanItem | null>>;
};

export function RepaymentDialog({ currency, loan, money, setLoan }: RepaymentDialogProps) {
    const form = useForm<RepaymentFormData>({
        resolver: zodResolver(LoanRepaymentFormSchema),
        defaultValues: {
            amount_input: '',
            payment_date: getCurrentDateTimeLocal(),
            note: '',
        },
    });

    const { mutate: addRepayment, isPending: addingRepayment } = useApiMutation<
        unknown,
        {
            amount: number;
            note?: string;
            payment_date?: string;
        }
    >(`/api/tools/expenses/loans/${loan?.id}/payments`, 'POST', {
        invalidateKeys: ['expense-summary', 'expense-loans'],
    });

    const handleAddPayment = (values: RepaymentFormData) => {
        if (!loan) return;
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
                    setLoan(null);
                    form.reset({
                        amount_input: '',
                        payment_date: getCurrentDateTimeLocal(),
                        note: '',
                    });
                },
            }
        );
    };

    const onOpenChange = (open: boolean) => {
        if (!open) {
            setLoan(null);
            form.reset({
                amount_input: '',
                payment_date: getCurrentDateTimeLocal(),
                note: '',
            });
        }
    };

    return (
        <Dialog onOpenChange={onOpenChange} open={!!loan}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Repayment</DialogTitle>
                    <DialogDescription>
                        {loan ? (
                            <span>
                                {loan.title} • Remaining: {money(loan.remaining_amount)}
                            </span>
                        ) : (
                            'Track a partial or full repayment.'
                        )}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(handleAddPayment)}>
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
                            name="payment_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Date & Time (optional)</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
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
                                onClick={() => onOpenChange(false)}
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
    );
}
