import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { comments } from '@/lib/drizzle/schema/blogs';
import { CreateCommentSchema } from '@/lib/zod-schema/blogs';

/**
 * POST /api/comments - Create a new comment on a blog post.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        if (!session.user.email_verified) {
            return sendErrorResponse('Please verify your email before commenting', 403);
        }

        const body = await req.json();

        const validation = await validateRequest(CreateCommentSchema, body);

        if (!validation.success) return validation.response;

        const { content, blog_id, parent_comment_id } = validation.data;

        const [newComment] = await db
            .insert(comments)
            .values({
                content,
                author_id: +session.user.id,
                blog_id,
                parent_comment_id: parent_comment_id || null,
            })
            .returning();

        return sendResponse('Comment', 'POST', newComment);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * DELETE /api/comments?id=123 - Delete a comment.
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const commentId = Number(req.nextUrl.searchParams.get('id'));

        if (!commentId) {
            return sendErrorResponse('Comment ID is required', 400);
        }

        const [comment] = await db
            .select()
            .from(comments)
            .where(eq(comments.id, commentId))
            .limit(1);

        if (!comment) {
            return sendErrorResponse('Comment not found', 404);
        }

        // Only author or admin can delete
        if (comment.author_id !== +session.user.id && session.user.role !== 'admin') {
            return sendErrorResponse('Forbidden', 403);
        }

        await db.delete(comments).where(eq(comments.id, commentId));

        return sendResponse('Comment', 'DELETE');
    } catch (error) {
        return sendErrorResponse(error);
    }
}
