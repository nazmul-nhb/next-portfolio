import { and, asc, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { conversations, directMessages } from '@/lib/drizzle/schema/messages';
import { users } from '@/lib/drizzle/schema/users';

/**
 * GET /api/messages/[conversationId] - Get messages in a conversation.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const { conversationId } = await params;
        const convId = Number(conversationId);
        const userId = Number(session.user.id);

        // Verify user is a participant
        const [conv] = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, convId))
            .limit(1);

        if (!conv || (conv.participant_one !== userId && conv.participant_two !== userId)) {
            return sendErrorResponse('Conversation not found', 404);
        }

        const messages = await db
            .select({
                id: directMessages.id,
                content: directMessages.content,
                is_read: directMessages.is_read,
                created_at: directMessages.created_at,
                sender: {
                    id: users.id,
                    name: users.name,
                    profile_image: users.profile_image,
                },
            })
            .from(directMessages)
            .innerJoin(users, eq(directMessages.sender_id, users.id))
            .where(eq(directMessages.conversation_id, convId))
            .orderBy(asc(directMessages.created_at));

        // Mark unread messages as read
        await db
            .update(directMessages)
            .set({ is_read: true })
            .where(
                and(
                    eq(directMessages.conversation_id, convId),
                    eq(directMessages.is_read, false),
                    eq(
                        directMessages.sender_id,
                        conv.participant_one === userId
                            ? conv.participant_two
                            : conv.participant_one
                    )
                )
            );

        return sendResponse('Message', 'GET', messages);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
