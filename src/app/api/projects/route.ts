import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { db } from '@/lib/drizzle';
import { projects } from '@/lib/drizzle/schema/projects';
import { ProjectCreationSchema } from '@/lib/zod-schema/projects';
import type { InsertProject } from '@/types/projects';

/** Get all projects */
export async function GET() {
    try {
        const result = await db.select().from(projects);
        return sendResponse('Project', 'GET', result);
    } catch (error) {
        console.error(error);

        return sendErrorResponse(error);
    }
}

/** * POST a new project */
export async function POST(req: Request) {
    try {
        const data: InsertProject = await req.json();

        const parsed = await validateRequest(ProjectCreationSchema, data);

        if (!parsed.success) {
            return parsed.response;
        }

        const [project] = await db.insert(projects).values(parsed.data).returning();

        if (!project?.id) {
            return sendErrorResponse('Error creating new project!');
        }

        revalidatePath('/admin/projects');
        revalidatePath('/(home)', 'page');

        return sendResponse('Project', 'POST', project);
    } catch (error) {
        console.error(error);

        return sendErrorResponse(error);
    }
}

/** Delete a project */
export async function DELETE(req: NextRequest) {
    try {
        const id = Number(req.nextUrl.searchParams.get('id'));

        if (!id || Number.isNaN(id)) {
            return sendErrorResponse('Valid project ID is required!');
        }

        const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning();

        if (!deleted?.id) {
            return sendErrorResponse('Project not found!');
        }

        revalidatePath('/admin/projects');
        revalidatePath('/(home)', 'page');

        return sendResponse('Project', 'DELETE', deleted);
    } catch (error) {
        console.error(error);
        return sendErrorResponse(error);
    }
}
