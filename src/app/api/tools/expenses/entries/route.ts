import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import type z from 'zod';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { expenses, receipts } from '@/lib/drizzle/schema/expenses';
import { CreateExpenseSchema } from '@/lib/zod-schema/expenses';
import type { ExpenseItem, PaginatedExpenses } from '@/types/expenses';

/**
 * GET /api/tools/expenses/entries - paginated expense/income entries.
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const userId = +session.user.id;
        const { searchParams } = new URL(req.url);

        const page = Math.max(1, Number(searchParams.get('page') || 1));
        const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 8)));
        const offset = (page - 1) * limit;
        const type = searchParams.get('type');
        const search = searchParams.get('search')?.trim();

        const whereConditions = [eq(expenses.user_id, userId)];

        if (type === 'income' || type === 'expense') {
            whereConditions.push(eq(expenses.type, type));
        }

        if (search) {
            whereConditions.push(
                or(
                    ilike(expenses.title, `%${search}%`),
                    ilike(expenses.description, `%${search}%`)
                ) as ReturnType<typeof eq>
            );
        }

        const whereClause = and(...whereConditions);

        const [countResult] = await db
            .select({ total: sql<number>`count(*)` })
            .from(expenses)
            .where(whereClause);

        const rows = await db
            .select()
            .from(expenses)
            .where(whereClause)
            .orderBy(desc(expenses.entry_date))
            .limit(limit)
            .offset(offset);

        const expenseIds = rows.map((row) => row.id);
        const receiptRows =
            expenseIds.length > 0
                ? await db
                      .select()
                      .from(receipts)
                      .where(
                          and(
                              eq(receipts.user_id, userId),
                              inArray(receipts.expense_id, expenseIds)
                          )
                      )
                : [];

        const receiptMap = new Map<number, typeof receiptRows>();

        for (const receipt of receiptRows) {
            const bucket = receiptMap.get(receipt.expense_id) || [];
            bucket.push(receipt);
            receiptMap.set(receipt.expense_id, bucket);
        }

        const entries: ExpenseItem[] = rows.map((entry) => ({
            ...entry,
            receipts: receiptMap.get(entry.id) || [],
        }));

        const total = Number(countResult?.total || 0);

        const response: PaginatedExpenses = {
            entries,
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };

        return sendResponse('Expense', 'GET', response);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * POST /api/tools/expenses/entries - create income/expense entry with optional receipts.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const userId = +session.user.id;
        const body = (await req.json()) as z.infer<typeof CreateExpenseSchema>;
        const validation = await validateRequest(CreateExpenseSchema, body);

        if (!validation.success) return validation.response;

        const { receipt_urls, ...payload } = validation.data;

        const [newEntry] = await db
            .insert(expenses)
            .values({
                ...payload,
                user_id: userId,
                description: payload.description || null,
            })
            .returning();

        if (!newEntry) throw new Error('Failed to create expense entry');

        const receiptValues =
            payload.type === 'expense'
                ? (receipt_urls || []).map((url) => ({
                      user_id: userId,
                      expense_id: newEntry.id,
                      image_url: url,
                  }))
                : [];

        const createdReceipts =
            receiptValues.length > 0
                ? await db.insert(receipts).values(receiptValues).returning()
                : [];

        const created = {
            ...newEntry,
            receipts: createdReceipts,
        };

        revalidatePath('/tools/expenses');

        return sendResponse('Expense', 'POST', created);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * DELETE /api/tools/expenses/entries?id=123 - delete an entry owned by the current user.
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const userId = +session.user.id;
        const id = Number(req.nextUrl.searchParams.get('id') || 0);

        if (!id || Number.isNaN(id)) {
            return sendErrorResponse('Valid entry id is required', 400);
        }

        const [existing] = await db
            .select({ id: expenses.id })
            .from(expenses)
            .where(and(eq(expenses.id, id), eq(expenses.user_id, userId)))
            .limit(1);

        if (!existing) {
            return sendErrorResponse('Expense entry not found', 404);
        }

        const attachedReceipts = await db
            .select({ image_url: receipts.image_url })
            .from(receipts)
            .where(and(eq(receipts.expense_id, id), eq(receipts.user_id, userId)));

        const [deleted] = await db
            .delete(expenses)
            .where(and(eq(expenses.id, id), eq(expenses.user_id, userId)))
            .returning();

        revalidatePath('/tools/expenses');

        return sendResponse('Expense', 'DELETE', {
            ...deleted,
            receipt_urls: attachedReceipts.map((item) => item.image_url),
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}
