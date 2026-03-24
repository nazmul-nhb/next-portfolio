import { createHash } from 'crypto';
import { and, desc, type eq, ilike, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import type z from 'zod';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { pollOptions, polls } from '@/lib/drizzle/schema/polls';
import { CreatePollSchema } from '@/lib/zod-schema/polls';
import type { PaginatedPolls, PollDetail } from '@/types/polls';

/**
 * GET /api/tools/polls - paginated polls with filtering by status and search.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;

        const page = Math.max(1, Number(searchParams.get('page') || 1));
        const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 10)));
        const offset = (page - 1) * limit;
        const search = searchParams.get('search')?.trim();
        const status = searchParams.get('status') as 'active' | 'upcoming' | 'expired' | null;
        const sort = (searchParams.get('sort') || 'latest') as 'latest' | 'mostVotes';

        const now = new Date();
        const whereConditions: Array<ReturnType<typeof eq>> = [];

        // Build where clause based on status
        if (status === 'upcoming') {
            whereConditions.push(sql`${polls.start_date} > ${now}`);
        } else if (status === 'active') {
            whereConditions.push(
                sql`${polls.start_date} <= ${now} AND (${polls.end_date} IS NULL OR ${polls.end_date} >= ${now})`
            );
        } else if (status === 'expired') {
            whereConditions.push(
                sql`${polls.end_date} IS NOT NULL AND ${polls.end_date} < ${now}`
            );
        }

        // Add search condition
        if (search) {
            whereConditions.push(ilike(polls.question, `%${search}%`));
        }

        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

        // Count total polls
        const [countResult] = await db
            .select({ total: sql<number>`count(*)` })
            .from(polls)
            .where(whereClause);

        // Fetch polls
        const pollRows = await db
            .select()
            .from(polls)
            .where(whereClause)
            .orderBy(sort === 'mostVotes' ? desc(polls.total_votes) : desc(polls.created_at))
            .limit(limit)
            .offset(offset);

        // Fetch options for each poll
        const pollIds = pollRows.map((p) => p.id);
        const optionRows =
            pollIds.length > 0
                ? await db
                      .select()
                      .from(pollOptions)
                      .where(sql`${pollOptions.poll_id} IN (${sql.raw(pollIds.join(','))})`)
                : [];

        // Map options to polls
        const optionMap = new Map<number, typeof optionRows>();
        for (const option of optionRows) {
            const bucket = optionMap.get(option.poll_id) || [];
            bucket.push(option);
            optionMap.set(option.poll_id, bucket);
        }

        // Build response polls with options
        const responsePolls: PollDetail[] = pollRows.map((poll) => {
            const opts = optionMap.get(poll.id) || [];
            const calculatedStatus = getPollStatus(poll.start_date, poll.end_date, now);
            return {
                ...poll,
                options: opts.map((opt) => ({
                    ...opt,
                    percentage:
                        poll.total_votes > 0
                            ? Math.round((opt.votes / poll.total_votes) * 100)
                            : 0,
                })),
                status: calculatedStatus,
            };
        });

        const total = Number(countResult?.total || 0);

        const response: PaginatedPolls = {
            polls: responsePolls,
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };

        return sendResponse('Poll', 'GET', response);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * POST /api/tools/polls - create a new poll.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const body = (await req.json()) as z.infer<typeof CreatePollSchema>;
        const validation = await validateRequest(CreatePollSchema, body);

        if (!validation.success) return validation.response;

        const { options, ...pollData } = validation.data;
        const userId = session?.user?.id ? +session.user.id : null;

        // If not authenticated, force anonymous
        const isAnonymous = !userId || pollData.is_anonymous;

        // Create poll
        const [newPoll] = await db
            .insert(polls)
            .values({
                user_id: userId,
                question: pollData.question,
                is_anonymous: isAnonymous,
                start_date: pollData.start_date || new Date(),
                end_date: pollData.end_date || null,
            })
            .returning();

        if (!newPoll) throw new Error('Failed to create poll');

        // Create options
        const optionValues = options.map((text) => ({
            poll_id: newPoll.id,
            text,
        }));

        const createdOptions = await db.insert(pollOptions).values(optionValues).returning();

        const calculatedStatus = getPollStatus(
            newPoll.start_date,
            newPoll.end_date,
            new Date()
        );

        const response = {
            ...newPoll,
            options: createdOptions.map((opt) => ({
                ...opt,
                percentage: 0,
            })),
            status: calculatedStatus,
        };

        revalidatePath('/tools/crowd-polls');

        return sendResponse('Poll', 'POST', response);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * Determine poll status based on dates.
 */
export function getPollStatus(
    startDate: Date,
    endDate: Date | null,
    now: Date
): 'upcoming' | 'active' | 'expired' {
    if (startDate > now) return 'upcoming';
    if (endDate && endDate < now) return 'expired';
    return 'active';
}

/**
 * Generate hash for anonymous voter tracking.
 * Uses IP address and user agent to create a consistent hash.
 */
export function generateVoterHash(ipAddress: string, userAgent: string): string {
    return createHash('sha256').update(`${ipAddress}:${userAgent}`).digest('hex');
}
