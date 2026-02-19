import { asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { db } from '@/lib/drizzle';
import { skills } from '@/lib/drizzle/schema/skills';
import { SkillCreationSchema, SkillUpdateSchema } from '@/lib/zod-schema/skills';
import type { InsertSkill, UpdateSkill } from '@/types/skills';

/** Get all skills */
export async function GET() {
    try {
        const result = await db
            .select()
            .from(skills)
            .orderBy(asc(skills.sort_order), asc(skills.title));
        return sendResponse('Skill', 'GET', result);
    } catch (error) {
        console.error(error);
        return sendErrorResponse(error);
    }
}

/** Create a new skill */
export async function POST(req: Request) {
    try {
        const data: InsertSkill = await req.json();

        const parsed = await validateRequest(SkillCreationSchema, data);

        if (!parsed.success) {
            return parsed.response;
        }

        const [skill] = await db.insert(skills).values(parsed.data).returning();

        if (!skill?.id) {
            return sendErrorResponse('Error creating new skill!');
        }
        revalidatePath('/admin/skills');
        revalidatePath('/resume');
        return sendResponse('Skill', 'POST', skill);
    } catch (error) {
        console.error(error);
        return sendErrorResponse(error);
    }
}

/** Update a skill */
export async function PATCH(req: NextRequest) {
    try {
        const id = Number(req.nextUrl.searchParams.get('id'));

        if (!id || Number.isNaN(id)) {
            return sendErrorResponse('Valid skill ID is required!');
        }

        const data: UpdateSkill = await req.json();

        const parsed = await validateRequest(SkillUpdateSchema, data);

        if (!parsed.success) {
            return parsed.response;
        }

        const [updated] = await db
            .update(skills)
            .set(parsed.data)
            .where(eq(skills.id, id))
            .returning();

        if (!updated?.id) {
            return sendErrorResponse('Skill not found!');
        }

        revalidatePath('/admin/skills');
        revalidatePath('/resume');

        return sendResponse('Skill', 'PATCH', updated);
    } catch (error) {
        console.error(error);
        return sendErrorResponse(error);
    }
}

/** Delete a skill */
export async function DELETE(req: NextRequest) {
    try {
        const id = Number(req.nextUrl.searchParams.get('id'));

        if (!id || Number.isNaN(id)) {
            return sendErrorResponse('Valid skill ID is required!');
        }

        const [deleted] = await db.delete(skills).where(eq(skills.id, id)).returning();

        if (!deleted?.id) {
            return sendErrorResponse('Skill not found!');
        }

        revalidatePath('/admin/skills');
        revalidatePath('/resume');

        return sendResponse('Skill', 'DELETE', { id: deleted.id });
    } catch (error) {
        console.error(error);
        return sendErrorResponse(error);
    }
}
