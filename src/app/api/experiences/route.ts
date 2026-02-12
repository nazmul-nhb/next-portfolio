import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { experiences } from '@/lib/drizzle/schema';
import { ExperienceCreationSchema, ExperienceUpdateSchema } from '@/lib/zod-schema/career';
import type { InsertExperience } from '@/types/career';

/**
 * GET /api/experiences - Fetches all experiences
 */
export async function GET() {
    try {
        const allExperiences = await db
            .select()
            .from(experiences)
            .orderBy(experiences.start_date);

        return sendResponse('Experience', 'GET', allExperiences);
    } catch (error) {
        console.error('Error fetching experiences:', error);
        return sendErrorResponse(error);
    }
}

/**
 * POST /api/experiences - Creates a new experience (admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'admin') {
            return sendErrorResponse('Unauthorized', 401);
        }

        const body = (await req.json()) as InsertExperience;
        const parsed = await validateRequest(ExperienceCreationSchema, body);

        if (!parsed.success) {
            return parsed.response;
        }

        const [newExperience] = await db.insert(experiences).values(parsed.data).returning();

        revalidatePath('/admin/experience');
        revalidatePath('/resume');

        return sendResponse('Experience', 'POST', newExperience);
    } catch (error) {
        console.error('Error creating experience:', error);
        return sendErrorResponse(error);
    }
}

/**
 * PATCH /api/experiences?id=123 - Updates an experience (admin only)
 */
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'admin') {
            return sendErrorResponse('Unauthorized', 401);
        }

        const id = req.nextUrl.searchParams.get('id');

        if (!id) {
            return sendErrorResponse('Experience ID is required', 400);
        }

        const body = await req.json();
        const parsed = await validateRequest(ExperienceUpdateSchema, body);

        if (!parsed.success) {
            return parsed.response;
        }

        const [updatedExperience] = await db
            .update(experiences)
            .set(parsed.data)
            .where(eq(experiences.id, Number.parseInt(id, 10)))
            .returning();

        if (!updatedExperience) {
            return sendErrorResponse('Experience not found', 404);
        }

        revalidatePath('/admin/experience');
        revalidatePath('/resume');

        return sendResponse('Experience', 'PATCH', updatedExperience);
    } catch (error) {
        console.error('Error updating experience:', error);
        return sendErrorResponse(error);
    }
}

/**
 * DELETE /api/experiences?id=123 - Deletes an experience (admin only)
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'admin') {
            return sendErrorResponse('Unauthorized', 401);
        }

        const id = req.nextUrl.searchParams.get('id');

        if (!id) {
            return sendErrorResponse('Experience ID is required', 400);
        }

        const [deleted] = await db
            .delete(experiences)
            .where(eq(experiences.id, Number.parseInt(id, 10)))
            .returning();

        if (!deleted) {
            return sendErrorResponse('Experience not found', 404);
        }

        revalidatePath('/admin/experience');
        revalidatePath('/resume');

        return sendResponse('Experience', 'DELETE', deleted);
    } catch (error) {
        console.error('Error deleting experience:', error);
        return sendErrorResponse(error);
    }
}
