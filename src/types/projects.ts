import type { projects } from '@/lib/drizzle/schema/projects';

export type InsertProject = Omit<
    typeof projects.$inferInsert,
    'id' | 'created_at' | 'updated_at'
>;
