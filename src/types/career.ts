import type { education, experiences } from '@/lib/drizzle/schema/career';
import type { ReplaceDate } from '@/types';

export type InsertExperience = typeof experiences.$inferInsert;
export type SelectExperience = ReplaceDate<typeof experiences.$inferSelect>;
export type UpdateExperience = Partial<InsertExperience>;

export type InsertEducation = typeof education.$inferInsert;
export type SelectEducation = ReplaceDate<typeof education.$inferSelect>;
export type UpdateEducation = Partial<InsertEducation>;
