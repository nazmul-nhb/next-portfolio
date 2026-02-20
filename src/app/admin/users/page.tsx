import { desc } from 'drizzle-orm';
import { db } from '@/lib/drizzle';
import { users } from '@/lib/drizzle/schema/users';
import { UsersClient } from './_components/UsersClient';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    let allUsers: (typeof users.$inferSelect)[] = [];

    try {
        allUsers = await db.select().from(users).orderBy(desc(users.created_at));
    } catch (error) {
        console.error('Error fetching users:', error);
    }

    return <UsersClient initialData={allUsers} />;
}
