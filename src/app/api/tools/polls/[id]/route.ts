import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { db } from '@/lib/drizzle';
import { pollOptions, polls } from '@/lib/drizzle/schema/polls';
import type { PollDetail } from '@/types/polls';
import { getPollStatus } from '../route';

/**
 * GET /api/tools/polls/:id - get poll details with options and vote counts.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const pollId = Number(id);

        if (!pollId || Number.isNaN(pollId)) {
            return sendErrorResponse('Invalid poll ID', 400);
        }

        const [poll] = await db.select().from(polls).where(eq(polls.id, pollId));

        if (!poll) {
            return sendErrorResponse('Poll not found', 404);
        }

        const options = await db
            .select()
            .from(pollOptions)
            .where(eq(pollOptions.poll_id, pollId));

        const now = new Date();
        const calculatedStatus = getPollStatus(poll.start_date, poll.end_date, now);

        const response: PollDetail = {
            ...poll,
            options: options.map((opt) => ({
                ...opt,
                percentage:
                    poll.total_votes > 0 ? Math.round((opt.votes / poll.total_votes) * 100) : 0,
            })),
            status: calculatedStatus,
        };

        return sendResponse('Poll', 'GET', response);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
