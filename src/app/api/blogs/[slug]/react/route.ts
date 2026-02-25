import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { blogReactions, blogs } from '@/lib/drizzle/schema/blogs';

type Params = { params: Promise<{ slug: string }> };

/**
 * POST /api/blogs/[slug]/react - Toggle a reaction on a blog post.
 * Body: { type: 'like' | 'dislike' }
 */
export async function POST(req: NextRequest, { params }: Params) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const { slug } = await params;
        const { type } = await req.json();

        if (!['like', 'dislike'].includes(type)) {
            return sendErrorResponse('Invalid reaction type', 400);
        }

        const userId = +session.user.id;

        const [blog] = await db
            .select({ id: blogs.id })
            .from(blogs)
            .where(eq(blogs.slug, slug))
            .limit(1);

        if (!blog) {
            return sendErrorResponse('Blog post not found', 404);
        }

        const [existing] = await db
            .select()
            .from(blogReactions)
            .where(and(eq(blogReactions.blog_id, blog.id), eq(blogReactions.user_id, userId)))
            .limit(1);

        if (existing) {
            if (existing.type === type) {
                // Same reaction — toggle off
                await db.delete(blogReactions).where(eq(blogReactions.id, existing.id));
            } else {
                // Switch reaction type
                await db
                    .update(blogReactions)
                    .set({ type })
                    .where(eq(blogReactions.id, existing.id));
            }
        } else {
            await db.insert(blogReactions).values({ blog_id: blog.id, user_id: userId, type });
        }

        // Return updated reaction counts
        const reactionRows = await db
            .select({ user_id: blogReactions.user_id, type: blogReactions.type })
            .from(blogReactions)
            .where(eq(blogReactions.blog_id, blog.id));

        const reactions = {
            like: reactionRows.filter((r) => r.type === 'like').map((r) => r.user_id),
            dislike: reactionRows.filter((r) => r.type === 'dislike').map((r) => r.user_id),
        };

        revalidatePath('/blogs');
        revalidatePath('/(home)', 'page');

        return sendResponse('Blog', 'PATCH', { reactions });
    } catch (error) {
        return sendErrorResponse(error);
    }
}
