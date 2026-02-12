import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { contactMessages } from '@/lib/drizzle/schema';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/contact-messages/[id] - Update message read status
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const { id } = await params;
        const messageId = Number.parseInt(id, 10);

        if (Number.isNaN(messageId)) {
            return sendErrorResponse('Invalid message ID', 400);
        }

        const body = await req.json();
        const { is_read, is_replied } = body;

        const updateData: { is_read?: boolean; is_replied?: boolean } = {};
        if (typeof is_read === 'boolean') updateData.is_read = is_read;
        if (typeof is_replied === 'boolean') updateData.is_replied = is_replied;

        if (Object.keys(updateData).length === 0) {
            return sendErrorResponse('No valid fields to update', 400);
        }

        const [updated] = await db
            .update(contactMessages)
            .set(updateData)
            .where(eq(contactMessages.id, messageId))
            .returning();

        if (!updated) {
            return sendErrorResponse('Message not found', 404);
        }

        return sendResponse('Contact Message', 'PATCH', updated);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
