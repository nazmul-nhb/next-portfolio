import z from 'zod';

export const SUPPORTED_CURRENCIES = [
    'USD',
    'BDT',
    'EUR',
    'GBP',
    'INR',
    'JPY',
    'CAD',
    'AUD',
    'SGD',
    'AED',
] as const;

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
        preferred_currency: z.enum(SUPPORTED_CURRENCIES),
    })
    .strict();
