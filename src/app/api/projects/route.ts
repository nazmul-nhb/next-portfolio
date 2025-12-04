import { sendErrorResponse } from '@/lib/actions/errorResponse';
import sendResponse from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { db } from '@/lib/drizzle';
import { projects } from '@/lib/drizzle/schema/projects';
import { ProjectCreationSchema } from '@/lib/schema/projects';
import type { InsertProject } from '@/types/projects';

/** Get all projects */
export async function GET() {
    // return Response.json({ message: 'hello World!' });
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
        return sendResponse('Project', 'POST', project);
    } catch (error) {
        console.error(error);

        return sendErrorResponse(error);
    }
}
