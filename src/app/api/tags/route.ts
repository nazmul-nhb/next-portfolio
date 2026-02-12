import type { NextRequest } from 'next/server';
import { slugifyString } from 'nhb-toolbox';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { tags } from '@/lib/drizzle/schema/blogs';
import { CreateTagSchema } from '@/lib/zod-schema/blogs';

/**
 * GET /api/tags - Fetch all tags.
 */
export async function GET() {
    try {
        const allTags = await db.select().from(tags);

        return sendResponse('Tag', 'GET', allTags);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * POST /api/tags - Create a new tag.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const body = await req.json();

        const validation = await validateRequest(CreateTagSchema, body);

        if (!validation.success) return validation.response;

        const { title } = validation.data;

        const [newTag] = await db
            .insert(tags)
            .values({ title, slug: slugifyString(title) })
            .returning();

        return sendResponse('Tag', 'POST', newTag);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
