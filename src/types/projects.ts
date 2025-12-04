import type { projects } from '@/lib/drizzle/schema/projects';

export type InsertProject = Omit<
    typeof projects.$inferInsert,
    'id' | 'created_at' | 'updated_at'
>;

export type SelectProject = typeof projects.$inferSelect;

export type UpdateProject = Partial<InsertProject>;
