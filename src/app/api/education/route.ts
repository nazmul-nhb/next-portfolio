import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { education } from '@/lib/drizzle/schema';
import { EducationCreationSchema, EducationUpdateSchema } from '@/lib/zod-schema/career';

/**
 * GET /api/education - Fetches all education records
 */
export async function GET() {
    try {
        const allEducation = await db.select().from(education).orderBy(education.start_date);

        return sendResponse('Education', 'GET', allEducation);
    } catch (error) {
        console.error('Error fetching education:', error);
        return sendErrorResponse(error);
    }
}

/**
 * POST /api/education - Creates a new education record (admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'admin') {
            return sendErrorResponse('Unauthorized', 401);
        }

        const body = await req.json();
        const parsed = await validateRequest(EducationCreationSchema, body);

        if (!parsed.success) {
            return parsed.response;
        }

        const [newEducation] = await db.insert(education).values(parsed.data).returning();

        revalidatePath('/admin/education');
        revalidatePath('/resume');

        return sendResponse('Education', 'POST', newEducation);
    } catch (error) {
        console.error('Error creating education:', error);
        return sendErrorResponse(error);
    }
}

/**
 * PATCH /api/education?id=123 - Updates an education record (admin only)
 */
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'admin') {
            return sendErrorResponse('Unauthorized', 401);
        }

        const id = req.nextUrl.searchParams.get('id');

        if (!id) {
            return sendErrorResponse('Education ID is required', 400);
        }

        const body = await req.json();
        const parsed = await validateRequest(EducationUpdateSchema, body);

        if (!parsed.success) {
            return parsed.response;
        }

        const [updatedEducation] = await db
            .update(education)
            .set(parsed.data)
            .where(eq(education.id, +id))
            .returning();

        if (!updatedEducation) {
            return sendErrorResponse('Education record not found', 404);
        }

        revalidatePath('/admin/education');
        revalidatePath('/resume');

        return sendResponse('Education', 'PATCH', updatedEducation);
    } catch (error) {
        console.error('Error updating education:', error);
        return sendErrorResponse(error);
    }
}

/**
 * DELETE /api/education?id=123 - Deletes an education record (admin only)
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'admin') {
            return sendErrorResponse('Unauthorized', 401);
        }

        const id = req.nextUrl.searchParams.get('id');

        if (!id) {
            return sendErrorResponse('Education ID is required', 400);
        }

        const [deleted] = await db.delete(education).where(eq(education.id, +id)).returning();

        if (!deleted) {
            return sendErrorResponse('Education record not found', 404);
        }

        revalidatePath('/admin/education');
        revalidatePath('/resume');

        return sendResponse('Education', 'DELETE', deleted);
    } catch (error) {
        console.error('Error deleting education:', error);
        return sendErrorResponse(error);
    }
}
