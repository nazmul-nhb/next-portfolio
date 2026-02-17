import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { blogs } from '@/lib/drizzle/schema/blogs';

/**
 * POST /api/blogs/[slug]/react - Toggle a reaction on a blog post.
 * Body: { type: 'like' | 'dislike' }
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
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

        const [blog] = await db.select().from(blogs).where(eq(blogs.slug, slug)).limit(1);

        if (!blog) {
            return sendErrorResponse('Blog post not found', 404);
        }

        const reactions = (blog.reactions as Record<string, number[]>) || {};
        const current = reactions[type] || [];
        const otherType = type === 'like' ? 'dislike' : 'like';

        // Toggle reaction
        if (current.includes(userId)) {
            reactions[type] = current.filter((id) => id !== userId);
        } else {
            reactions[type] = [...current, userId];
            // Remove from opposite reaction
            if (reactions[otherType]?.includes(userId)) {
                reactions[otherType] = reactions[otherType].filter((id) => id !== userId);
            }
        }

        await db.update(blogs).set({ reactions }).where(eq(blogs.id, blog.id));

        revalidatePath('/blogs');
        revalidatePath('/(home)', 'page');

        return sendResponse('Blog', 'PATCH', { reactions });
    } catch (error) {
        return sendErrorResponse(error);
    }
}
