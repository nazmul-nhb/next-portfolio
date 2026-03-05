'use client';

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
import { Textarea } from '@/components/ui/textarea';
import type { LoanItem } from '@/types/expenses';
import type { RepaymentFormData } from './types';

type RepaymentDialogProps = {
    open: boolean;
    currency: string;
    loan: LoanItem | null;
    addingRepayment: boolean;
    form: UseFormReturn<RepaymentFormData>;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: RepaymentFormData) => void;
    money: (value: number) => string;
};

export function RepaymentDialog({
    addingRepayment,
    currency,
    form,
    loan,
    money,
    onOpenChange,
    onSubmit,
    open,
}: RepaymentDialogProps) {
    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
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
                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
                            <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
                                Cancel
                            </Button>
                            <Button disabled={addingRepayment} loading={addingRepayment} type="submit">
                                Add Payment
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
