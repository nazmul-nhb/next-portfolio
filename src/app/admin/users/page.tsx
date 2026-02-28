import { desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import { db } from '@/lib/drizzle';
import { users } from '@/lib/drizzle/schema/users';
import type { RawUser } from '@/types/users';
import { UsersClient } from './_components/UsersClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Manage Users » Admin Dashboard',
};

export default async function UsersPage() {
    let allUsers: RawUser[] = [];

    try {
        allUsers = await db.select().from(users).orderBy(desc(users.created_at));
    } catch (error) {
        console.error('Error fetching users:', error);
    }

    return <UsersClient initialData={allUsers} />;
}
