import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';
import { contactMessages } from '@/lib/drizzle/schema/messages';

/** Schema for contact form submissions. */
export const ContactFormSchema = createInsertSchema(contactMessages)
    .omit({
        id: true,
        created_at: true,
        is_read: true,
        is_replied: true,
    })
    .extend({
        name: z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(128, 'Name must be at most 128 characters'),
        email: z.string().email('Please enter a valid email address'),
        subject: z.string().max(256, 'Subject must be at most 256 characters').optional(),
        message: z
            .string()
            .min(10, 'Message must be at least 10 characters')
            .max(5000, 'Message must be at most 5000 characters'),
    })
    .strict();

/** Schema for sending a direct message. */
export const DirectMessageSchema = z
    .object({
        recipient_id: z.number(),
        content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message is too long'),
    })
    .strict();
