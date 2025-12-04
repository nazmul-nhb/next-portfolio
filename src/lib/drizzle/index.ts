import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { projects } from '@/lib/drizzle/Projects';

const sql = neon(process.env.DATABASE_URL as string);
export const db = drizzle(sql, { schema: { projects } });
