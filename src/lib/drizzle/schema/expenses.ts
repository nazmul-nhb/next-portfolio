import {
    integer,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

/** Enum for standard income/expense entry types */
export const expenseTypeEnum = pgEnum('expense_type', ['income', 'expense']);

/** Enum for loan direction */
export const loanTypeEnum = pgEnum('loan_type', ['borrowed', 'lent']);

/** Enum for loan settlement status */
export const loanStatusEnum = pgEnum('loan_status', ['active', 'settled']);

/** Income and expense entries. Amount is stored in minor units (e.g., cents). */
export const expenses = pgTable('expenses', {
    id: serial().primaryKey(),
    user_id: integer()
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar({ length: 180 }).notNull(),
    description: text(),
    amount: integer().notNull(),
    type: expenseTypeEnum().notNull(),
    entry_date: timestamp().defaultNow().notNull(),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp()
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});

/** Borrowed and lent money records. Amounts are stored in minor units. */
export const loans = pgTable('loans', {
    id: serial().primaryKey(),
    user_id: integer()
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar({ length: 180 }).notNull(),
    counterparty: varchar({ length: 128 }),
    notes: text(),
    type: loanTypeEnum().notNull(),
    principal_amount: integer().notNull(),
    paid_amount: integer().default(0).notNull(),
    status: loanStatusEnum().default('active').notNull(),
    due_date: timestamp(),
    start_date: timestamp().defaultNow().notNull(),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp()
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});

/** Loan repayment history. Each payment belongs to one loan. */
export const loanPayments = pgTable('loan_payments', {
    id: serial().primaryKey(),
    loan_id: integer()
        .notNull()
        .references(() => loans.id, { onDelete: 'cascade' }),
    user_id: integer()
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    amount: integer().notNull(),
    note: text(),
    payment_date: timestamp().defaultNow().notNull(),
    created_at: timestamp().defaultNow().notNull(),
});

/** Optional receipt images attached to expense entries. */
export const receipts = pgTable('receipts', {
    id: serial().primaryKey(),
    expense_id: integer().references(() => expenses.id, { onDelete: 'cascade' }),
    loan_id: integer().references(() => loans.id, { onDelete: 'cascade' }),
    user_id: integer()
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    image_url: varchar({ length: 512 }).notNull(),
    created_at: timestamp().defaultNow().notNull(),
});
