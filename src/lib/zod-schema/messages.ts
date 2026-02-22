import z from 'zod';

/** Schema for contact form submissions. */
export const ContactFormSchema = z
    .object({
        name: z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(128, 'Name must not exceed 128 characters')
            .trim(),
        email: z.email('Please enter a valid email address'),
        subject: z
            .string()
            .max(256, 'Subject must not exceed 256 characters')
            .trim()
            .optional(),
        message: z
            .string()
            .min(2, 'Message must be at least 2 characters')
            .max(5000, 'Message must not exceed 5000 characters')
            .trim(),
    })
    .strict();

/** Schema for sending a direct message. */
export const DirectMessageSchema = z
    .object({
        recipient_id: z.number(),
        content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message is too long'),
    })
    .strict();
