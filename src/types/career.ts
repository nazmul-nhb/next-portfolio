import type { education, experiences } from '@/lib/drizzle/schema/career';

export type InsertExperience = typeof experiences.$inferInsert;
export type SelectExperience = typeof experiences.$inferSelect;
export type UpdateExperience = Partial<InsertExperience>;

export type InsertEducation = typeof education.$inferInsert;
export type SelectEducation = typeof education.$inferSelect;
export type UpdateEducation = Partial<InsertEducation>;
