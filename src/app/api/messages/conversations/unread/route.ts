import { and, count, eq, or } from 'drizzle-orm';
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

        // Get all conversations where user is a participant
        const userConversations = await db
            .select({
                id: conversations.id,
                participant_one: conversations.participant_one,
                participant_two: conversations.participant_two,
            })
            .from(conversations)
            .where(
                or(
                    eq(conversations.participant_one, userId),
                    eq(conversations.participant_two, userId)
                )
            );

        // Fetch other user details for each conversation
        const unreadCount = await Promise.all(
            userConversations.map(async (conv) => {
                const [result] = await db
                    .select({
                        count: count(),
                    })
                    .from(directMessages)
                    .where(
                        and(
                            eq(directMessages.conversation_id, conv.id),
                            eq(directMessages.is_read, false),
                            eq(
                                directMessages.sender_id,
                                conv.participant_one === userId
                                    ? conv.participant_two
                                    : conv.participant_one
                            )
                        )
                    );

                return result.count;
            })
        );

        return sendResponse('Conversation', 'GET', {
            unread_count: unreadCount.reduce((a, b) => a + b, 0),
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}
