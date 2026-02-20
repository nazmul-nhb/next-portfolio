import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { slugifyString } from 'nhb-toolbox';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { categories } from '@/lib/drizzle/schema/blogs';
import { CreateCategorySchema } from '@/lib/zod-schema/blogs';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/categories/[id] - Update a category (admin only).
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'admin') {
            return sendErrorResponse('Forbidden', 403);
        }

        const { id } = await params;
        const categoryId = +id;

        if (Number.isNaN(categoryId)) {
            return sendErrorResponse('Invalid category ID', 400);
        }

        const body = await req.json();
        const validation = await validateRequest(CreateCategorySchema, body);

        if (!validation.success) return validation.response;

        const { title } = validation.data;

        const [updated] = await db
            .update(categories)
            .set({ title, slug: slugifyString(title) })
            .where(eq(categories.id, categoryId))
            .returning();

        if (!updated) {
            return sendErrorResponse('Category not found', 404);
        }

        return sendResponse('Category', 'PATCH', updated);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * DELETE /api/categories/[id] - Delete a category (admin only).
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'admin') {
            return sendErrorResponse('Forbidden', 403);
        }

        const { id } = await params;
        const categoryId = +id;

        if (Number.isNaN(categoryId)) {
            return sendErrorResponse('Invalid category ID', 400);
        }

        const [deleted] = await db
            .delete(categories)
            .where(eq(categories.id, categoryId))
            .returning();

        if (!deleted) {
            return sendErrorResponse('Category not found', 404);
        }

        return sendResponse('Category', 'DELETE', deleted);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
