import { createHash } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import type z from 'zod';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { pollOptions, polls, pollVotes } from '@/lib/drizzle/schema/polls';
import { VoteSchema } from '@/lib/zod-schema/polls';
import { getPollStatus } from '../../route';

/**
 * POST /api/tools/polls/:id/vote - vote on a poll option.
 * Prevents duplicate votes using voterHash (IP+UserAgent) or userId.
 * Note: No transaction support in Neon serverless, so we're careful with operation order.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const pollId = Number(id);

        if (!pollId || Number.isNaN(pollId)) {
            return sendErrorResponse('Invalid poll ID', 400);
        }

        // Validate request body
        const body = (await req.json()) as z.infer<typeof VoteSchema>;
        const validation = await validateRequest(VoteSchema, body);
        if (!validation.success) return validation.response;

        const { option_id: optionId } = validation.data;
        const session = await auth();
        const userId = session?.user?.id ? +session.user.id : null;

        // Get client IP and user agent for voter hash
        const clientIp = req.headers.get('x-forwarded-for') || '0.0.0.0';
        const userAgent = req.headers.get('user-agent') || 'unknown';
        const voterHash = generateVoterHash(clientIp, userAgent);

        // 1. Get poll and check if it exists and is active
        const [poll] = await db.select().from(polls).where(eq(polls.id, pollId));

        if (!poll) {
            return sendErrorResponse('Poll not found', 404);
        }

        const now = new Date();
        const pollStatus = getPollStatus(poll.start_date, poll.end_date, now);

        if (pollStatus !== 'active') {
            return sendErrorResponse(`Cannot vote on a ${pollStatus} poll`, 400);
        }

        // 2. Check if option exists and belongs to this poll
        const [option] = await db
            .select()
            .from(pollOptions)
            .where(and(eq(pollOptions.id, optionId), eq(pollOptions.poll_id, pollId)));

        if (!option) {
            return sendErrorResponse('Option not found', 404);
        }

        // 3. Prevent duplicate votes
        // For authenticated users, check by userId. For anonymous, check by voterHash.
        const voteCheckCondition = userId
            ? eq(pollVotes.user_id, userId)
            : sql`${pollVotes.voter_hash} = ${voterHash} AND ${pollVotes.user_id} IS NULL`;

        const existingVote = await db
            .select()
            .from(pollVotes)
            .where(and(eq(pollVotes.poll_id, pollId), voteCheckCondition));

        if (existingVote.length > 0) {
            return sendErrorResponse('You have already voted on this poll', 400);
        }

        // 4. Update option vote count
        await db
            .update(pollOptions)
            .set({ votes: sql`${pollOptions.votes} + 1` })
            .where(eq(pollOptions.id, optionId));

        // 5. Update poll total_votes
        await db
            .update(polls)
            .set({ total_votes: sql`${polls.total_votes} + 1` })
            .where(eq(polls.id, pollId));

        // 6. Record the vote
        const [insertedVote] = await db
            .insert(pollVotes)
            .values({
                poll_id: pollId,
                user_id: userId,
                voter_hash: voterHash,
            })
            .returning();

        if (!insertedVote) throw new Error('Failed to record vote');

        // 7. Get updated option and poll for response
        const [updatedOption] = await db
            .select()
            .from(pollOptions)
            .where(eq(pollOptions.id, optionId));

        const [updatedPoll] = await db.select().from(polls).where(eq(polls.id, pollId));

        if (!updatedPoll || !updatedOption) {
            throw new Error('Failed to retrieve updated data');
        }

        const response = {
            poll_id: pollId,
            option_id: optionId,
            votes: updatedOption.votes,
            total_votes: updatedPoll.total_votes,
            percentage: Math.round((updatedOption.votes / updatedPoll.total_votes) * 100),
        };

        return sendResponse('Vote', 'POST', response);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * Generate hash for anonymous voter tracking.
 */
function generateVoterHash(ipAddress: string, userAgent: string): string {
    return createHash('sha256').update(`${ipAddress}:${userAgent}`).digest('hex');
}
