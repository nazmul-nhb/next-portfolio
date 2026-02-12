import {
    boolean,
    integer,
    jsonb,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

/** Blogs table schema */
export const blogs = pgTable('blogs', {
    id: serial().primaryKey(),
    title: varchar({ length: 256 }).notNull(),
    slug: varchar({ length: 300 }).notNull().unique(),
    content: text().notNull(),
    author_id: integer()
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    cover_image: varchar({ length: 512 }),
    excerpt: text(),
    is_published: boolean().default(false).notNull(),
    published_date: timestamp(),
    views: integer().default(0).notNull(),
    reactions: jsonb().$type<Record<string, number[]>>().default({}),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp()
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});

/** Tags table schema */
export const tags = pgTable('tags', {
    id: serial().primaryKey(),
    title: varchar({ length: 64 }).notNull().unique(),
    slug: varchar({ length: 100 }).notNull().unique(),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp()
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});

/** Categories table schema */
export const categories = pgTable('categories', {
    id: serial().primaryKey(),
    title: varchar({ length: 128 }).notNull().unique(),
    slug: varchar({ length: 160 }).notNull().unique(),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp()
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});

/** Blog-Tags junction table */
export const blogTags = pgTable('blog_tags', {
    id: serial().primaryKey(),
    blog_id: integer()
        .notNull()
        .references(() => blogs.id, { onDelete: 'cascade' }),
    tag_id: integer()
        .notNull()
        .references(() => tags.id, { onDelete: 'cascade' }),
});

/** Blog-Categories junction table */
export const blogCategories = pgTable('blog_categories', {
    id: serial().primaryKey(),
    blog_id: integer()
        .notNull()
        .references(() => blogs.id, { onDelete: 'cascade' }),
    category_id: integer()
        .notNull()
        .references(() => categories.id, { onDelete: 'cascade' }),
});

/** Comments table schema */
export const comments = pgTable('comments', {
    id: serial().primaryKey(),
    content: text().notNull(),
    author_id: integer()
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    blog_id: integer()
        .notNull()
        .references(() => blogs.id, { onDelete: 'cascade' }),
    parent_comment_id: integer(),
    reactions: jsonb().$type<Record<string, number[]>>().default({}),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp()
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});
