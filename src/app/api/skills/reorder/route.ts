import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { isValidArray } from 'nhb-toolbox';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { db } from '@/lib/drizzle';
import { skills } from '@/lib/drizzle/schema/skills';
import type { ReorderItem } from '@/types';

/** Bulk update skill ordering */
export async function PUT(req: Request) {
    try {
        const items: ReorderItem[] = await req.json();

        if (!isValidArray<ReorderItem>(items)) {
            return sendErrorResponse('Invalid reorder data!', 400);
        }

        await Promise.all(
            items.map(({ id, sort_order }) =>
                db.update(skills).set({ sort_order }).where(eq(skills.id, id))
            )
        );

        revalidatePath('/admin/skills');
        revalidatePath('/resume');
        revalidatePath('/');

        return sendResponse('Skill', 'PUT', { reordered: items.length });
    } catch (error) {
        console.error(error);
        return sendErrorResponse(error);
    }
}
