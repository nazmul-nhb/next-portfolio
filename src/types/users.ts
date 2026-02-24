import type { users } from '@/lib/drizzle/schema';

export type RawUser = typeof users.$inferSelect;
