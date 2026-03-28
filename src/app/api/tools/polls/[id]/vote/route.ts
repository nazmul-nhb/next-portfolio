import { createHash } from 'node:crypto';
import { and, eq, or, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import type z from 'zod';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { pollOptions, polls, pollVotes } from '@/lib/drizzle/schema/polls';
import { VoteSchema } from '@/lib/zod-schema/polls';
import type { Params } from '@/types';
import { getPollStatus } from '../../route';

/**
 * POST /api/tools/polls/:id/vote - vote on a poll option.
 * Supports changing votes: if the user already voted, their vote is moved to the new option.
 * Prevents duplicate votes using voterHash (IP+UserAgent) or userId.
 */
export async function POST(req: NextRequest, { params }: Params) {
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

        // 3. Check for existing vote
        const voteCheckCondition = userId
            ? eq(pollVotes.user_id, userId)
            : sql`${pollVotes.voter_hash} = ${voterHash} AND ${pollVotes.user_id} IS NULL`;

        const [existingVote] = await db
            .select()
            .from(pollVotes)
            .where(and(eq(pollVotes.poll_id, pollId), voteCheckCondition));

        if (existingVote) {
            // Change vote: move from old option to new option
            if (existingVote.option_id === optionId) {
                return sendErrorResponse('You have already voted for this option', 400);
            }

            // Decrement old option votes
            await db
                .update(pollOptions)
                .set({ votes: sql`GREATEST(${pollOptions.votes} - 1, 0)` })
                .where(eq(pollOptions.id, existingVote.option_id));

            // Increment new option votes
            await db
                .update(pollOptions)
                .set({ votes: sql`${pollOptions.votes} + 1` })
                .where(eq(pollOptions.id, optionId));

            // Update vote record
            await db
                .update(pollVotes)
                .set({ option_id: optionId })
                .where(eq(pollVotes.id, existingVote.id));

            return sendResponse(
                'Vote',
                'PATCH',
                {
                    poll_id: pollId,
                    option_id: optionId,
                    previous_option_id: existingVote.option_id,
                    changed: true,
                },
                'Vote changed successfully'
            );
        }

        // New vote: update option vote count
        await db
            .update(pollOptions)
            .set({ votes: sql`${pollOptions.votes} + 1` })
            .where(eq(pollOptions.id, optionId));

        // Update poll total_votes
        await db
            .update(polls)
            .set({ total_votes: sql`${polls.total_votes} + 1` })
            .where(eq(polls.id, pollId));

        // Record the vote
        const [insertedVote] = await db
            .insert(pollVotes)
            .values({
                poll_id: pollId,
                option_id: optionId,
                user_id: userId,
                voter_hash: voterHash,
            })
            .returning();

        if (!insertedVote) throw new Error('Failed to record vote');

        return sendResponse('Vote', 'POST', {
            poll_id: pollId,
            option_id: optionId,
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * DELETE /api/tools/polls/:id/vote - unvote (remove vote) from a poll.
 * Only allowed for logged-in users whose IP+UserAgent match.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const pollId = Number(id);

        if (!pollId || Number.isNaN(pollId)) {
            return sendErrorResponse('Invalid poll ID', 400);
        }

        const session = await auth();
        const userId = session?.user?.id ? +session.user.id : null;

        if (!userId) {
            return sendErrorResponse('Must be logged in to unvote', 401);
        }

        const clientIp = req.headers.get('x-forwarded-for') || '0.0.0.0';
        const userAgent = req.headers.get('user-agent') || 'unknown';
        const voterHash = generateVoterHash(clientIp, userAgent);

        // 1. Check poll exists and is active
        const [poll] = await db.select().from(polls).where(eq(polls.id, pollId));
        if (!poll) {
            return sendErrorResponse('Poll not found', 404);
        }

        const now = new Date();
        const pollStatus = getPollStatus(poll.start_date, poll.end_date, now);
        if (pollStatus !== 'active') {
            return sendErrorResponse(`Cannot unvote on a ${pollStatus} poll`, 400);
        }

        // 2. Find existing vote (must match user_id OR voter_hash for security)
        const [existingVote] = await db
            .select()
            .from(pollVotes)
            .where(
                and(
                    eq(pollVotes.poll_id, pollId),
                    or(eq(pollVotes.user_id, userId), eq(pollVotes.voter_hash, voterHash))
                )
            );

        if (!existingVote) {
            return sendErrorResponse('No vote found to remove, or device mismatch', 400);
        }

        // Remove vote
        await db
            .update(pollOptions)
            .set({ votes: sql`GREATEST(${pollOptions.votes} - 1, 0)` })
            .where(eq(pollOptions.id, existingVote.option_id));

        await db
            .update(polls)
            .set({ total_votes: sql`GREATEST(${polls.total_votes} - 1, 0)` })
            .where(eq(polls.id, pollId));

        await db.delete(pollVotes).where(eq(pollVotes.id, existingVote.id));

        return sendResponse('Vote', 'DELETE', null, 'Vote removed successfully');
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
