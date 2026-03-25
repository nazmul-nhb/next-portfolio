import z from 'zod';

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
        start_date: z.coerce.date().optional(),
        end_date: z.coerce.date().optional(),
        is_anonymous: z.boolean().default(false),
    })
    .strict()
    .refine(
        (data) => {
            if (data.start_date && data.end_date) {
                return data.start_date < data.end_date;
            }
            return true;
        },
        {
            message: 'End date must be after start date',
            path: ['end_date'],
        }
    );

export const UpdatePollSchema = z
    .object({
        question: z
            .string()
            .min(1, 'Question is required')
            .max(500, 'Question must be at most 500 characters')
            .trim()
            .optional(),
        end_date: z.coerce.date().nullable().optional(),
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
