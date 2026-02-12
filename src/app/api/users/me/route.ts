import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { users } from '@/lib/drizzle/schema/users';
import { UpdateProfileSchema } from '@/lib/zod-schema/users';

/**
 * GET /api/users/me - Get current user's profile.
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const [user] = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                profile_image: users.profile_image,
                bio: users.bio,
                role: users.role,
                provider: users.provider,
                email_verified: users.email_verified,
                created_at: users.created_at,
            })
            .from(users)
            .where(eq(users.id, Number(session.user.id)))
            .limit(1);

        if (!user) {
            return sendErrorResponse('User not found', 404);
        }

        return sendResponse('User', 'GET', user);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * PATCH /api/users/me - Update current user's profile.
 */
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const body = await req.json();

        const validation = await validateRequest(UpdateProfileSchema, body);

        if (!validation.success) return validation.response;

        const [updated] = await db
            .update(users)
            .set(validation.data)
            .where(eq(users.id, Number(session.user.id)))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                profile_image: users.profile_image,
                bio: users.bio,
                role: users.role,
            });

        return sendResponse('User', 'PATCH', updated);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
