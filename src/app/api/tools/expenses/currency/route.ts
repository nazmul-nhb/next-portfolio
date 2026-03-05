import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import type z from 'zod';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { users } from '@/lib/drizzle/schema/users';
import { CurrencyPreferenceSchema } from '@/lib/zod-schema/expenses';

/**
 * GET /api/tools/expenses/currency - get current user's preferred currency.
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const [user] = await db
            .select({
                preferred_currency: users.preferred_currency,
            })
            .from(users)
            .where(eq(users.id, +session.user.id))
            .limit(1);

        if (!user) {
            return sendErrorResponse('User not found', 404);
        }

        return sendResponse('User', 'GET', user);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * PATCH /api/tools/expenses/currency - update current user's preferred currency.
 */
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const body = (await req.json()) as z.infer<typeof CurrencyPreferenceSchema>;
        const validation = await validateRequest(CurrencyPreferenceSchema, body);

        if (!validation.success) return validation.response;

        const [updated] = await db
            .update(users)
            .set({
                preferred_currency: validation.data.preferred_currency,
            })
            .where(eq(users.id, +session.user.id))
            .returning({
                preferred_currency: users.preferred_currency,
            });

        return sendResponse('User', 'PATCH', updated);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
