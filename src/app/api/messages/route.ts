import { and, desc, eq, or } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { conversations, directMessages } from '@/lib/drizzle/schema/messages';
import { users } from '@/lib/drizzle/schema/users';
import { DirectMessageSchema } from '@/lib/zod-schema/messages';

/**
 * GET /api/messages - Get all conversations for the current user.
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const userId = Number(session.user.id);

        const userConversations = await db
            .select()
            .from(conversations)
            .where(
                or(
                    eq(conversations.participant_one, userId),
                    eq(conversations.participant_two, userId)
                )
            )
            .orderBy(desc(conversations.last_message_at));

        // Enrich with participant info and last message
        const enriched = await Promise.all(
            userConversations.map(async (conv) => {
                const otherUserId =
                    conv.participant_one === userId
                        ? conv.participant_two
                        : conv.participant_one;

                const [otherUser] = await db
                    .select({
                        id: users.id,
                        name: users.name,
                        profile_image: users.profile_image,
                    })
                    .from(users)
                    .where(eq(users.id, otherUserId))
                    .limit(1);

                const [lastMessage] = await db
                    .select({
                        content: directMessages.content,
                        sender_id: directMessages.sender_id,
                        is_read: directMessages.is_read,
                        created_at: directMessages.created_at,
                    })
                    .from(directMessages)
                    .where(eq(directMessages.conversation_id, conv.id))
                    .orderBy(desc(directMessages.created_at))
                    .limit(1);

                // Count unread messages
                const unread = await db
                    .select({ id: directMessages.id })
                    .from(directMessages)
                    .where(
                        and(
                            eq(directMessages.conversation_id, conv.id),
                            eq(directMessages.is_read, false),
                            eq(directMessages.sender_id, otherUserId)
                        )
                    );

                return {
                    id: conv.id,
                    participant: otherUser,
                    lastMessage,
                    unreadCount: unread.length,
                    last_message_at: conv.last_message_at,
                };
            })
        );

        return sendResponse('Conversation', 'GET', enriched);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * POST /api/messages - Send a direct message.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        if (!session.user.email_verified) {
            return sendErrorResponse('Please verify your email before sending messages', 403);
        }

        const body = await req.json();

        const validation = await validateRequest(DirectMessageSchema, body);

        if (!validation.success) return validation.response;

        const { recipient_id, content } = validation.data;
        const senderId = Number(session.user.id);

        if (senderId === recipient_id) {
            return sendErrorResponse('Cannot send message to yourself', 400);
        }

        // Find or create conversation
        let [conversation] = await db
            .select()
            .from(conversations)
            .where(
                or(
                    and(
                        eq(conversations.participant_one, senderId),
                        eq(conversations.participant_two, recipient_id)
                    ),
                    and(
                        eq(conversations.participant_one, recipient_id),
                        eq(conversations.participant_two, senderId)
                    )
                )
            )
            .limit(1);

        if (!conversation) {
            [conversation] = await db
                .insert(conversations)
                .values({
                    participant_one: senderId,
                    participant_two: recipient_id,
                })
                .returning();
        }

        // Create message
        const [message] = await db
            .insert(directMessages)
            .values({
                conversation_id: conversation.id,
                sender_id: senderId,
                content,
            })
            .returning();

        // Update conversation timestamp
        await db
            .update(conversations)
            .set({ last_message_at: new Date() })
            .where(eq(conversations.id, conversation.id));

        return sendResponse('Message', 'POST', message);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
