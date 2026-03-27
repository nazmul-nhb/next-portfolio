import { and, count, eq, ne, or } from 'drizzle-orm';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { conversations, directMessages } from '@/lib/drizzle/schema';

/**
 * GET /api/messages/conversations/unread - Get all conversations for the current user
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const userId = +session.user.id;

        const [{ unread_count }] = await db
            .select({
                unread_count: count(),
            })
            .from(directMessages)
            .innerJoin(conversations, eq(directMessages.conversation_id, conversations.id))
            .where(
                and(
                    eq(directMessages.is_read, false),
                    // exclude messages sent by current user
                    ne(directMessages.sender_id, userId),
                    or(
                        eq(conversations.participant_one, userId),
                        eq(conversations.participant_two, userId)
                    )
                )
            );

        return sendResponse('Conversation', 'GET', { unread_count });
    } catch (error) {
        return sendErrorResponse(error);
    }
}
