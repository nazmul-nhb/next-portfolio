import { pgTable, serial, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const projects = pgTable(
    'projects',
    {
        id: serial().primaryKey(),
        title: varchar({ length: 128 }).notNull(),
        live_link: varchar({ length: 256 }).notNull(),
        favicon: varchar({ length: 256 }).notNull(),
        repo_links: varchar({ length: 256 }).array().notNull(),
        tech_stack: varchar({ length: 64 }).array().notNull(),
        screenshots: varchar({ length: 256 }).array().notNull(),
        features: varchar({ length: 512 }).array().notNull(),
        description: varchar().notNull(),
        created_at: timestamp().defaultNow().notNull(),
        updated_at: timestamp()
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return [uniqueIndex('title_idx').on(table.title)];
    }
);
