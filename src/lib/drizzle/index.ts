import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '@/configs/env';
import { projects } from '@/lib/drizzle/schema/projects';

const sql = neon(env.dbUrl);

export const db = drizzle(sql, { schema: { projects } });
