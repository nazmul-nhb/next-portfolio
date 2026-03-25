import z from 'zod';
import { parseDateTimeLocal } from '@/lib/utils';

export const CreatePollSchema = z
    .object({
        question: z
            .string()
            .min(1, 'Question is required')
            .max(500, 'Question must be at most 500 characters')
            .trim(),
        options: z
            .array(
                z
                    .string()
                    .min(1, 'Option cannot be empty')
                    .max(300, 'Option must be at most 300 characters')
                    .trim()
            )
            .min(2, 'At least 2 options are required')
            .max(10, 'Maximum 10 options allowed'),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
        is_anonymous: z.boolean().default(false),
    })
    .strict()
    .superRefine(({ start_date, end_date }, ctx) => {
        const startDate = parseDateTimeLocal(start_date);
        const endDate = parseDateTimeLocal(end_date);

        if (!startDate) {
            ctx.addIssue({
                code: 'custom',
                message: 'Enter a valid start date and time.',
                path: ['start_date'],
            });
        }

        if (!endDate) {
            ctx.addIssue({
                code: 'custom',
                message: 'Enter a valid comparison date and time.',
                path: ['end_date'],
            });
        }

        if (startDate && endDate && startDate > endDate) {
            ctx.addIssue({
                code: 'custom',
                message: 'The end date must be after the start date.',
                path: ['end_date'],
            });
        }
    });

export const UpdatePollSchema = z
    .object({
        question: z
            .string()
            .min(1, 'Question is required')
            .max(500, 'Question must be at most 500 characters')
            .trim()
            .optional(),
        end_date: CreatePollSchema.shape.end_date.optional(),
        is_anonymous: z.boolean().optional(),
    })
    .strict();

export const VoteSchema = z
    .object({
        poll_id: z
            .number()
            .int('Poll ID must be an integer')
            .positive('Poll ID must be positive'),
        option_id: z
            .number()
            .int('Option ID must be an integer')
            .positive('Option ID must be positive'),
    })
    .strict();

export const SearchPollsSchema = z
    .object({
        search: z.string().trim().optional(),
        status: z.enum(['active', 'upcoming', 'expired']).optional(),
        sort: z.enum(['latest', 'mostVotes']).default('latest'),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
    })
    .strict();
