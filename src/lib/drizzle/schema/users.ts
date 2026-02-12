import {
    boolean,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';

/** Enum for user roles */
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

/** Enum for auth providers */
export const authProviderEnum = pgEnum('auth_provider', ['credentials', 'google']);

/** Users table schema */
export const users = pgTable('users', {
    id: serial().primaryKey(),
    name: varchar({ length: 128 }).notNull(),
    email: varchar({ length: 256 }).notNull().unique(),
    password: text(),
    profile_image: varchar({ length: 512 }),
    bio: text(),
    role: userRoleEnum().default('user').notNull(),
    provider: authProviderEnum().default('credentials').notNull(),
    email_verified: boolean().default(false).notNull(),
    is_active: boolean().default(true).notNull(),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp()
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});
