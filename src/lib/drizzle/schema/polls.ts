import {
    boolean,
    integer,
    pgEnum,
    pgTable,
    serial,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

/** Enum for poll status */
export const pollStatusEnum = pgEnum('poll_status', ['upcoming', 'active', 'expired']);

/** Polls with optional user association for anonymous voting. */
export const polls = pgTable('polls', {
    id: serial().primaryKey(),
    user_id: integer().references(() => users.id, { onDelete: 'cascade' }),
    question: varchar({ length: 500 }).notNull(),
    is_anonymous: boolean().default(false).notNull(),
    start_date: timestamp().defaultNow().notNull(),
    end_date: timestamp(),
    total_votes: integer().default(0).notNull(),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp()
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});

/** Poll options with vote counts. */
export const pollOptions = pgTable('poll_options', {
    id: serial().primaryKey(),
    poll_id: integer()
        .notNull()
        .references(() => polls.id, { onDelete: 'cascade' }),
    text: varchar({ length: 300 }).notNull(),
    votes: integer().default(0).notNull(),
    created_at: timestamp().defaultNow().notNull(),
});

/** Poll votes for duplicate prevention and tracking. Uses voterHash for anonymous users. */
export const pollVotes = pgTable('poll_votes', {
    id: serial().primaryKey(),
    poll_id: integer()
        .notNull()
        .references(() => polls.id, { onDelete: 'cascade' }),
    option_id: integer()
        .notNull()
        .references(() => pollOptions.id, { onDelete: 'cascade' }),
    user_id: integer().references(() => users.id, { onDelete: 'cascade' }),
    voter_hash: varchar({ length: 256 }).notNull(),
    created_at: timestamp().defaultNow().notNull(),
});
