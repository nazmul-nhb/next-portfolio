import { z } from 'zod';
import { ImageSchema } from './files';

/**
 * * Schema for creating a new testimonial (from database insert)
 */
export const TestimonialCreationSchema = z.object({
    client_name: z.string().min(1, 'Client name is required').max(128),
    client_role: z.string().max(128).optional(),
    client_company: z.string().max(128).optional(),
    client_avatar: z.string().max(512).optional(),
    content: z.string().min(1, 'Content is required'),
    rating: z.number().int().min(1).max(5).default(5),
});

/**
 * * Schema for updating an existing testimonial
 */
export const TestimonialUpdateSchema = TestimonialCreationSchema.partial();

/**
 * * Schema for testimonial form with FileList for avatar upload
 */
export const TestimonialFormSchema = TestimonialCreationSchema.omit({
    client_avatar: true,
}).extend({
    client_avatar: ImageSchema.optional(),
});

/**
 * * Schema for updating testimonial form
 */
export const TestimonialFormUpdateSchema = TestimonialFormSchema.partial();
