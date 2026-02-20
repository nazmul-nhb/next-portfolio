import { desc, eq } from 'drizzle-orm';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { blogs } from '@/lib/drizzle/schema/blogs';

/**
 * GET /api/blogs/my - Get all blogs authored by the current user.
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const userId = +session.user.id;

        const myBlogs = await db
            .select({
                id: blogs.id,
                title: blogs.title,
                slug: blogs.slug,
                excerpt: blogs.excerpt,
                cover_image: blogs.cover_image,
                is_published: blogs.is_published,
                published_date: blogs.published_date,
                views: blogs.views,
                created_at: blogs.created_at,
            })
            .from(blogs)
            .where(eq(blogs.author_id, userId))
            .orderBy(desc(blogs.created_at));

        return sendResponse('Blog', 'GET', myBlogs);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
