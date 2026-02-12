import { pgTable, serial, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const experiences = pgTable(
    'experiences',
    {
        id: serial().primaryKey(),
        position: varchar({ length: 128 }).notNull(),
        company: varchar({ length: 128 }).notNull(),
        company_logo: varchar({ length: 512 }),
        location: varchar({ length: 128 }),
        start_date: varchar({ length: 32 }).notNull(), // e.g., "Jan 2020" or "2020"
        end_date: varchar({ length: 32 }), // null means current
        description: text().notNull(),
        technologies: varchar({ length: 64 }).array().notNull(),
        achievements: text().array().notNull(),
        created_at: timestamp().defaultNow().notNull(),
        updated_at: timestamp()
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return [
            uniqueIndex('experience_position_company_idx').on(table.position, table.company),
        ];
    }
);

export const education = pgTable('education', {
    id: serial().primaryKey(),
    degree: varchar({ length: 128 }).notNull(),
    institution: varchar({ length: 128 }).notNull(),
    institution_logo: varchar({ length: 512 }),
    location: varchar({ length: 128 }),
    start_date: varchar({ length: 32 }).notNull(),
    end_date: varchar({ length: 32 }),
    grade: varchar({ length: 64 }),
    description: text(),
    achievements: text().array(),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp()
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});
