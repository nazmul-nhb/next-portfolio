import type { skills } from '@/lib/drizzle/schema/skills';

export type InsertSkill = Omit<typeof skills.$inferInsert, 'id' | 'created_at' | 'updated_at'>;

export type SelectSkill = typeof skills.$inferSelect;

export type UpdateSkill = Partial<InsertSkill>;
