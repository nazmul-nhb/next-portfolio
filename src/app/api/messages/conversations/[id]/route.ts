import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { conversations, directMessages } from '@/lib/drizzle/schema';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/messages/conversations/[id] - Get all messages in a conversation
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const { id } = await params;
        const conversationId = +id;

        if (Number.isNaN(conversationId)) {
            return sendErrorResponse('Invalid conversation ID', 400);
        }

        // Verify user is part of this conversation
        const [conversation] = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, conversationId))
            .limit(1);

        if (!conversation) {
            return sendErrorResponse('Conversation not found', 404);
        }

        if (
            conversation.participant_one !== +session.user.id &&
            conversation.participant_two !== +session.user.id
        ) {
            return sendErrorResponse('Forbidden', 403);
        }

        // Get messages
        const messages = await db
            .select()
            .from(directMessages)
            .where(eq(directMessages.conversation_id, conversationId))
            .orderBy(directMessages.created_at);

        // Mark messages as read
        await db
            .update(directMessages)
            .set({ is_read: true })
            .where(eq(directMessages.conversation_id, conversationId));

        return sendResponse('Message', 'GET', messages);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * POST /api/messages/conversations/[id] - Send a message in a conversation
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const { id } = await params;
        const conversationId = +id;

        if (Number.isNaN(conversationId)) {
            return sendErrorResponse('Invalid conversation ID', 400);
        }

        const body = await req.json();
        const { content } = body;

        if (!content || typeof content !== 'string' || !content.trim()) {
            return sendErrorResponse('Message content is required', 400);
        }

        // Verify user is part of this conversation
        const [conversation] = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, conversationId))
            .limit(1);

        if (!conversation) {
            return sendErrorResponse('Conversation not found', 404);
        }

        if (
            conversation.participant_one !== +session.user.id &&
            conversation.participant_two !== +session.user.id
        ) {
            return sendErrorResponse('Forbidden', 403);
        }

        // Create message
        const [message] = await db
            .insert(directMessages)
            .values({
                conversation_id: conversationId,
                sender_id: +session.user.id,
                content: content.trim(),
            })
            .returning();

        // Update conversation last_message_at
        await db
            .update(conversations)
            .set({ last_message_at: new Date() })
            .where(eq(conversations.id, conversationId));

        return sendResponse('Message', 'POST', message);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
