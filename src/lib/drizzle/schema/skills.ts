import { pgTable, serial, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const skills = pgTable(
    'skills',
    {
        id: serial().primaryKey(),
        title: varchar({ length: 64 }).notNull(),
        icon: varchar({ length: 512 }).notNull(),
        created_at: timestamp().defaultNow().notNull(),
        updated_at: timestamp()
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return [uniqueIndex('skill_title_idx').on(table.title)];
    }
);
