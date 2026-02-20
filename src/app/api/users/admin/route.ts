import { desc, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { users } from '@/lib/drizzle/schema/users';

/**
 * GET /api/users/admin — Get all users (admin only).
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'admin') {
            return sendErrorResponse('Unauthorized', 401);
        }

        const allUsers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                profile_image: users.profile_image,
                bio: users.bio,
                role: users.role,
                provider: users.provider,
                email_verified: users.email_verified,
                is_active: users.is_active,
                created_at: users.created_at,
                updated_at: users.updated_at,
            })
            .from(users)
            .orderBy(desc(users.created_at));

        return sendResponse('User', 'GET', allUsers);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * PATCH /api/users/admin — Update user role or active status (admin only).
 * Body: { user_id: number, role?: 'admin' | 'user', is_active?: boolean }
 */
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'admin') {
            return sendErrorResponse('Unauthorized', 401);
        }

        const body = await req.json();
        const { user_id, role, is_active } = body as {
            user_id: number;
            role?: 'admin' | 'user';
            is_active?: boolean;
        };

        if (!user_id) {
            return sendErrorResponse('User ID is required', 400);
        }

        // Prevent admin from modifying themselves
        if (user_id === +session.user.id) {
            return sendErrorResponse('Cannot modify your own account', 400);
        }

        const updates: Record<string, unknown> = {};
        if (role !== undefined) updates.role = role;
        if (is_active !== undefined) updates.is_active = is_active;

        if (Object.keys(updates).length === 0) {
            return sendErrorResponse('No updates provided', 400);
        }

        const [updated] = await db
            .update(users)
            .set(updates)
            .where(eq(users.id, user_id))
            .returning({
                id: users.id,
                name: users.name,
                role: users.role,
                is_active: users.is_active,
            });

        if (!updated) {
            return sendErrorResponse('User not found', 404);
        }

        return sendResponse('User', 'PATCH', updated);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * DELETE /api/users/admin?id=123 — Delete a user (admin only).
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'admin') {
            return sendErrorResponse('Unauthorized', 401);
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return sendErrorResponse('User ID is required', 400);
        }

        // Prevent admin from deleting themselves
        if (+id === +session.user.id) {
            return sendErrorResponse('Cannot delete your own account', 400);
        }

        const [deleted] = await db
            .delete(users)
            .where(eq(users.id, +id))
            .returning({ id: users.id });

        if (!deleted) {
            return sendErrorResponse('User not found', 404);
        }

        return sendResponse('User', 'DELETE', deleted);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
