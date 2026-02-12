import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

/**
 * * Table for client testimonials and feedback to build credibility
 */
export const testimonials = pgTable('testimonials', {
    id: serial('id').primaryKey(),
    client_name: varchar('client_name', { length: 128 }).notNull(),
    client_role: varchar('client_role', { length: 128 }),
    client_company: varchar('client_company', { length: 128 }),
    client_avatar: varchar('client_avatar', { length: 512 }),
    content: text('content').notNull(),
    rating: integer('rating').notNull().default(5), // 1-5 stars
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at')
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
