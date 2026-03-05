import type z from 'zod';
import {
    AddExpenseEntryFormSchema,
    LoanRepaymentFormSchema,
} from '@/lib/zod-schema/expenses';

export type AddEntryFormData = z.infer<typeof AddExpenseEntryFormSchema>;
export type RepaymentFormData = z.infer<typeof LoanRepaymentFormSchema>;
