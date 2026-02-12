import type { testimonials } from '@/lib/drizzle/schema/testimonials';

/**
 * * Type for inserting a new testimonial
 */
export type InsertTestimonial = typeof testimonials.$inferInsert;

/**
 * * Type for selecting a testimonial from database
 */
export type SelectTestimonial = typeof testimonials.$inferSelect;

/**
 * * Type for updating a testimonial
 */
export type UpdateTestimonial = Partial<InsertTestimonial>;
