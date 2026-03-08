import { CURRENCY_CODES } from 'nhb-toolbox/constants';
import z from 'zod';

const MoneySchema = z
    .number()
    .int('Amount must be an integer in minor units')
    .positive('Amount must be greater than zero');

const CloudinaryAssetSchema = z
    .string('Must be a valid cloudinary image')
    .startsWith('v', { error: 'Must be a valid cloudinary image' });

export const CreateExpenseSchema = z
    .object({
        title: z
            .string()
            .min(1, 'Title is required')
            .max(180, 'Title must be at most 180 characters')
            .trim(),
        description: z
            .string()
            .max(2000, 'Description must be at most 2000 characters')
            .trim()
            .optional(),
        amount: MoneySchema,
        type: z.enum(['income', 'expense']),
        entry_date: z.coerce.date().optional(),
        receipt_urls: z.array(CloudinaryAssetSchema).max(10).optional(),
    })
    .strict();

export const CreateLoanSchema = z
    .object({
        title: z
            .string()
            .min(1, 'Title is required')
            .max(180, 'Title must be at most 180 characters')
            .trim(),
        counterparty: z
            .string()
            .max(128, 'Counterparty must be at most 128 characters')
            .trim()
            .optional(),
        notes: z.string().max(2000, 'Notes must be at most 2000 characters').trim().optional(),
        type: z.enum(['borrowed', 'lent']),
        principal_amount: MoneySchema,
        due_date: z.coerce.date().optional(),
        start_date: z.coerce.date().optional(),
        receipt_urls: z.array(CloudinaryAssetSchema).max(10).optional(),
    })
    .strict();

export const UpdateLoanSchema = z
    .object({
        title: z.string().min(1).max(180).trim().optional(),
        counterparty: z.string().max(128).trim().optional(),
        notes: z.string().max(2000).trim().optional(),
        status: z.enum(['active', 'settled']).optional(),
        due_date: z.union([z.coerce.date(), z.null()]).optional(),
    })
    .strict();

export const PaymentSchema = z
    .object({
        amount: MoneySchema,
        note: z.string().max(1000, 'Note must be at most 1000 characters').trim().optional(),
        payment_date: z.coerce.date().optional(),
    })
    .strict();

export const CurrencyPreferenceSchema = z
    .object({
        preferred_currency: z.enum(CURRENCY_CODES),
    })
    .strict();

const AmountInputSchema = z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
        message: 'Enter a valid amount',
    });

export const AddExpenseEntryFormSchema = z
    .object({
        entry_kind: z.enum(['income', 'expense', 'loan_borrowed', 'loan_lent']),
        title: z
            .string()
            .min(1, 'Title is required')
            .max(180, 'Title must be at most 180 characters')
            .trim(),
        amount_input: AmountInputSchema,
        description: z
            .string()
            .max(2000, 'Description must be at most 2000 characters')
            .optional(),
        counterparty: z
            .string()
            .max(128, 'Counterparty must be at most 128 characters')
            .optional(),
        due_date: z.string().optional(),
        entry_date: z.string().optional(),
        receipt_files: z.array(z.custom<File>()).max(10).optional(),
    })
    .strict();

export const LoanRepaymentFormSchema = z
    .object({
        amount_input: AmountInputSchema,
        payment_date: z.string().optional(),
        note: z.string().max(1000, 'Note must be at most 1000 characters').optional(),
    })
    .strict();
