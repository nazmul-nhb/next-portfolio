import { and, asc, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import type z from 'zod';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { pollOptions, polls, pollVotes } from '@/lib/drizzle/schema/polls';
import { users } from '@/lib/drizzle/schema/users';
import { UpdatePollSchema } from '@/lib/zod-schema/polls';
import type { PollDetail, PollVoterDetail } from '@/types/polls';
import { generateVoterHash, getPollStatus } from '../route';

/**
 * GET /api/tools/polls/:id - get poll details with options, vote counts, and hasVoted.
 * Admin users also get voter details for logged-in users.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const pollId = Number(id);

        if (!pollId || Number.isNaN(pollId)) {
            return sendErrorResponse('Invalid poll ID', 400);
        }

        const session = await auth();
        const userId = session?.user?.id ? +session.user.id : null;
        const isAdmin = session?.user?.role === 'admin';
        const clientIp = req.headers.get('x-forwarded-for') || '0.0.0.0';
        const userAgent = req.headers.get('user-agent') || 'unknown';
        const voterHash = generateVoterHash(clientIp, userAgent);

        const [poll] = await db.select().from(polls).where(eq(polls.id, pollId));

        if (!poll) {
            return sendErrorResponse('Poll not found', 404);
        }

        const options = await db
            .select()
            .from(pollOptions)
            .where(eq(pollOptions.poll_id, pollId))
            .orderBy(asc(pollOptions.id));

        // Count actual votes per option from pollVotes (source of truth)
        const voteCounts = await db
            .select({
                option_id: pollVotes.option_id,
                count: sql<number>`count(*)::int`,
            })
            .from(pollVotes)
            .where(eq(pollVotes.poll_id, pollId))
            .groupBy(pollVotes.option_id);

        const voteCountMap = new Map(voteCounts.map((v) => [v.option_id, v.count]));

        // Check if current user/visitor has voted
        const [existingVote] = await db
            .select({ option_id: pollVotes.option_id })
            .from(pollVotes)
            .where(
                and(
                    eq(pollVotes.poll_id, pollId),
                    userId
                        ? eq(pollVotes.user_id, userId)
                        : sql`${pollVotes.voter_hash} = ${voterHash} AND ${pollVotes.user_id} IS NULL`
                )
            );

        // Get creator name
        let creatorName: string | undefined;
        if (poll.user_id) {
            const [creator] = await db
                .select({ name: users.name })
                .from(users)
                .where(eq(users.id, poll.user_id));
            creatorName = creator?.name;
        }

        // Admin can see voter details (only logged-in user votes)
        let voters: PollVoterDetail[] | undefined;
        if (isAdmin) {
            const voterRows = await db
                .select({
                    user_id: pollVotes.user_id,
                    option_id: pollVotes.option_id,
                    voted_at: pollVotes.created_at,
                    user_name: users.name,
                    user_image: users.profile_image,
                })
                .from(pollVotes)
                .leftJoin(users, eq(pollVotes.user_id, users.id))
                .where(eq(pollVotes.poll_id, pollId));

            voters = voterRows.map((v) => {
                const option = options.find((o) => o.id === v.option_id);
                return {
                    user_id: v.user_id,
                    user_name: v.user_name ?? undefined,
                    user_image: v.user_image,
                    option_id: v.option_id,
                    option_text: option?.text ?? 'Unknown',
                    voted_at: v.voted_at,
                    is_anonymous: !v.user_id,
                };
            });
        }

        const now = new Date();
        const calculatedStatus = getPollStatus(poll.start_date, poll.end_date, now);

        // Count anonymous vs logged-in votes
        const [voteStats] = await db
            .select({
                anonymous_votes: sql<number>`count(*) FILTER (WHERE ${pollVotes.user_id} IS NULL)`,
                logged_in_votes: sql<number>`count(*) FILTER (WHERE ${pollVotes.user_id} IS NOT NULL)`,
            })
            .from(pollVotes)
            .where(eq(pollVotes.poll_id, pollId));

        // Compute totals from pollVotes records (source of truth)
        const actualTotalVotes = voteCounts.reduce((sum, v) => sum + v.count, 0);

        const response: PollDetail & {
            anonymous_votes: number;
            logged_in_votes: number;
        } = {
            ...poll,
            total_votes: actualTotalVotes,
            options: options.map((opt) => {
                const votes = voteCountMap.get(opt.id) ?? 0;
                return {
                    ...opt,
                    votes,
                    percentage:
                        actualTotalVotes > 0 ? Math.round((votes / actualTotalVotes) * 100) : 0,
                };
            }),
            status: calculatedStatus,
            voted_option_id: existingVote?.option_id ?? null,
            creator_name: creatorName,
            voters,
            anonymous_votes: Number(voteStats?.anonymous_votes ?? 0),
            logged_in_votes: Number(voteStats?.logged_in_votes ?? 0),
        };

        return sendResponse('Poll', 'GET', response);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * PATCH /api/tools/polls/:id - update poll (admin or creator only).
 * Can update question, end_date (expiry), is_anonymous.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const pollId = Number(id);

        if (!pollId || Number.isNaN(pollId)) {
            return sendErrorResponse('Invalid poll ID', 400);
        }

        const session = await auth();
        if (!session?.user?.id) {
            return sendErrorResponse('Authentication required', 401);
        }

        const userId = +session.user.id;
        const isAdmin = session.user.role === 'admin';

        const [poll] = await db.select().from(polls).where(eq(polls.id, pollId));
        if (!poll) {
            return sendErrorResponse('Poll not found', 404);
        }

        // Only admin or poll creator can update
        if (!isAdmin && poll.user_id !== userId) {
            return sendErrorResponse('Not authorized to update this poll', 403);
        }

        const body = (await req.json()) as z.infer<typeof UpdatePollSchema>;

        const validation = await validateRequest(UpdatePollSchema, body);
        if (!validation.success) return validation.response;

        const updateData: Record<string, unknown> = {};
        if (validation.data.question !== undefined)
            updateData.question = validation.data.question;
        if (validation.data.end_date !== undefined)
            updateData.end_date = new Date(validation.data.end_date);
        if (validation.data.is_anonymous !== undefined)
            updateData.is_anonymous = validation.data.is_anonymous;

        if (Object.keys(updateData).length === 0) {
            return sendErrorResponse('No fields to update', 400);
        }

        const [updatedPoll] = await db
            .update(polls)
            .set(updateData)
            .where(eq(polls.id, pollId))
            .returning();

        if (!updatedPoll) throw new Error('Failed to update poll');

        revalidatePath('/tools/crowd-polls');

        return sendResponse('Poll', 'PATCH', updatedPoll);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * DELETE /api/tools/polls/:id - delete poll (admin or creator only).
 */
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const pollId = Number(id);

        if (!pollId || Number.isNaN(pollId)) {
            return sendErrorResponse('Invalid poll ID', 400);
        }

        const session = await auth();
        if (!session?.user?.id) {
            return sendErrorResponse('Authentication required', 401);
        }

        const userId = +session.user.id;
        const isAdmin = session.user.role === 'admin';

        const [poll] = await db.select().from(polls).where(eq(polls.id, pollId));
        if (!poll) {
            return sendErrorResponse('Poll not found', 404);
        }

        // Only admin or poll creator can delete
        if (!isAdmin && poll.user_id !== userId) {
            return sendErrorResponse('Not authorized to delete this poll', 403);
        }

        await db.delete(polls).where(eq(polls.id, pollId));

        revalidatePath('/tools/crowd-polls');

        return sendResponse('Poll', 'DELETE');
    } catch (error) {
        return sendErrorResponse(error);
    }
}
