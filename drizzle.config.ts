import { defineConfig } from 'drizzle-kit';
import { ENV } from '@/configs/env';

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/lib/drizzle/schema/*',
    out: './migrations',
    // driver: 'aws-data-api',
    dbCredentials: {
        url: ENV.dbUrl,
    },
    migrations: {
        schema: 'public',
        prefix: 'timestamp',
    },
    introspect: {
        casing: 'preserve',
    },
    verbose: true,
    strict: true,
});
