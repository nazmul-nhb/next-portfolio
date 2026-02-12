import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { contactMessages } from '@/lib/drizzle/schema';

/**
 * DELETE /api/contact-messages - Delete a contact message (admin only)
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return sendErrorResponse('Forbidden', 403);
        }

        const { searchParams } = new URL(req.url);
        const idParam = searchParams.get('id');

        if (!idParam) {
            return sendErrorResponse('Message ID is required', 400);
        }

        const id = Number.parseInt(idParam, 10);
        if (Number.isNaN(id)) {
            return sendErrorResponse('Invalid message ID', 400);
        }

        const [deleted] = await db
            .delete(contactMessages)
            .where(eq(contactMessages.id, id))
            .returning();

        if (!deleted) {
            return sendErrorResponse('Message not found', 404);
        }

        revalidatePath('/admin/messages');

        return sendResponse('Contact Message', 'DELETE', deleted);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
