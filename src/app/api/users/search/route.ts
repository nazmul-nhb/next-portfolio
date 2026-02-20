import { ilike, or } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { users } from '@/lib/drizzle/schema/users';

/**
 * GET /api/users/search?q=query - Search users by name or email.
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query || query.trim().length < 2) {
            return sendResponse('User', 'GET', []);
        }

        const searchPattern = `%${query.trim()}%`;

        const results = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                profile_image: users.profile_image,
            })
            .from(users)
            .where(or(ilike(users.name, searchPattern), ilike(users.email, searchPattern)))
            .limit(10);

        // Filter out current user
        const filtered = results.filter((u) => u.id !== +session.user.id);

        return sendResponse('User', 'GET', filtered);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
