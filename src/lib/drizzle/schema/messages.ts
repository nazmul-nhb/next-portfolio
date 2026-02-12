import {
    boolean,
    integer,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

/** Contact messages table (from contact form) */
export const contactMessages = pgTable('contact_messages', {
    id: serial().primaryKey(),
    name: varchar({ length: 128 }).notNull(),
    email: varchar({ length: 256 }).notNull(),
    subject: varchar({ length: 256 }),
    message: text().notNull(),
    is_read: boolean().default(false).notNull(),
    is_replied: boolean().default(false).notNull(),
    created_at: timestamp().defaultNow().notNull(),
});

/** Conversations table for user-to-user messaging */
export const conversations = pgTable('conversations', {
    id: serial().primaryKey(),
    participant_one: integer()
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    participant_two: integer()
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    last_message_at: timestamp().defaultNow().notNull(),
    created_at: timestamp().defaultNow().notNull(),
});

/** Direct messages between users */
export const directMessages = pgTable('direct_messages', {
    id: serial().primaryKey(),
    conversation_id: integer()
        .notNull()
        .references(() => conversations.id, { onDelete: 'cascade' }),
    sender_id: integer()
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    content: text().notNull(),
    is_read: boolean().default(false).notNull(),
    created_at: timestamp().defaultNow().notNull(),
});

/** OTP verification codes */
export const otpCodes = pgTable('otp_codes', {
    id: serial().primaryKey(),
    email: varchar({ length: 256 }).notNull(),
    code: varchar({ length: 6 }).notNull(),
    expires_at: timestamp().notNull(),
    is_used: boolean().default(false).notNull(),
    created_at: timestamp().defaultNow().notNull(),
});
