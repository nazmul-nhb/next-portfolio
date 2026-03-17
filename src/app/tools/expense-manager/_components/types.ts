import type { CurrencyCode } from 'nhb-toolbox/number/types';
import type z from 'zod';
import type {
    AddExpenseEntryFormSchema,
    LoanRepaymentFormSchema,
} from '@/lib/zod-schema/expenses';

export type AddEntryFormData = z.infer<typeof AddExpenseEntryFormSchema>;
export type RepaymentFormData = z.infer<typeof LoanRepaymentFormSchema>;

export type CurrencyResponse = {
    preferred_currency: CurrencyCode;
};
