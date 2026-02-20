import { and, desc, eq, or } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { conversations, users } from '@/lib/drizzle/schema';

/**
 * GET /api/messages/conversations - Get all conversations for the current user
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
                last_message_at: conversations.last_message_at,
                created_at: conversations.created_at,
            })
            .from(conversations)
            .where(
                or(
                    eq(conversations.participant_one, userId),
                    eq(conversations.participant_two, userId)
                )
            )
            .orderBy(desc(conversations.last_message_at));

        // Fetch other user details for each conversation
        const conversationsWithUsers = await Promise.all(
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

                return {
                    ...conv,
                    otherUser,
                };
            })
        );

        return sendResponse('Conversation', 'GET', conversationsWithUsers);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * POST /api/messages/conversations - Create a new conversation
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const body = await req.json();
        const { participant_id, email } = body;

        const userId = +session.user.id;
        let participantId: number;

        if (email) {
            // Look up user by email
            const [participant] = await db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

            if (!participant) {
                return sendErrorResponse('No user found with that email', 404);
            }

            participantId = participant.id;
        } else if (participant_id) {
            participantId = +participant_id;
        } else {
            return sendErrorResponse('email or participant_id is required', 400);
        }

        if (userId === participantId) {
            return sendErrorResponse('Cannot start a conversation with yourself', 400);
        }

        // Check if conversation already exists
        const [existing] = await db
            .select()
            .from(conversations)
            .where(
                or(
                    and(
                        eq(conversations.participant_one, userId),
                        eq(conversations.participant_two, participantId)
                    ),
                    and(
                        eq(conversations.participant_one, participantId),
                        eq(conversations.participant_two, userId)
                    )
                )
            )
            .limit(1);

        if (existing) {
            return sendResponse('Conversation', 'GET', existing);
        }

        // Create new conversation
        const [newConversation] = await db
            .insert(conversations)
            .values({
                participant_one: userId,
                participant_two: participantId,
            })
            .returning();

        return sendResponse('Conversation', 'POST', newConversation);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
