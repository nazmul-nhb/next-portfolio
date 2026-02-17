import { eq } from 'drizzle-orm';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { db } from '@/lib/drizzle';
import { users } from '@/lib/drizzle/schema/users';

/**
 * GET /api/users/[id] - Get a user's public profile by ID.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const [user] = await db
            .select({
                id: users.id,
                name: users.name,
                profile_image: users.profile_image,
                bio: users.bio,
                role: users.role,
                created_at: users.created_at,
            })
            .from(users)
            .where(eq(users.id, +id))
            .limit(1);

        if (!user) {
            return sendErrorResponse('User not found', 404);
        }

        return sendResponse('User', 'GET', user);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
