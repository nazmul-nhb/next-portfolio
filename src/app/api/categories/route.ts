import type { NextRequest } from 'next/server';
import { slugifyString } from 'nhb-toolbox';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { categories } from '@/lib/drizzle/schema/blogs';
import { CreateCategorySchema } from '@/lib/zod-schema/blogs';

/**
 * GET /api/categories - Fetch all categories.
 */
export async function GET() {
    try {
        const allCategories = await db.select().from(categories);

        return sendResponse('Category', 'GET', allCategories);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * POST /api/categories - Create a new category (admin only).
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'admin') {
            return sendErrorResponse('Forbidden', 403);
        }

        const body = await req.json();

        const validation = await validateRequest(CreateCategorySchema, body);

        if (!validation.success) return validation.response;

        const { title } = validation.data;

        const [newCategory] = await db
            .insert(categories)
            .values({ title, slug: slugifyString(title) })
            .returning();

        return sendResponse('Category', 'POST', newCategory);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
