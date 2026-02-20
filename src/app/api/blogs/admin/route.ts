import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { blogs } from '@/lib/drizzle/schema/blogs';
import { users } from '@/lib/drizzle/schema/users';

/**
 * GET /api/blogs/admin - Get all blogs (including unpublished) for admin.
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'admin') {
            return sendErrorResponse('Forbidden', 403);
        }

        const allBlogs = await db
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
                author: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    profile_image: users.profile_image,
                },
            })
            .from(blogs)
            .innerJoin(users, eq(blogs.author_id, users.id))
            .orderBy(desc(blogs.created_at));

        return sendResponse('Blog', 'GET', allBlogs);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * PATCH /api/blogs/admin - Approve (publish) or unpublish a blog post.
 */
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'admin') {
            return sendErrorResponse('Forbidden', 403);
        }

        const body = await req.json();
        const { blog_id, is_published } = body;

        if (!blog_id || typeof is_published !== 'boolean') {
            return sendErrorResponse('blog_id and is_published are required', 400);
        }

        const [updated] = await db
            .update(blogs)
            .set({
                is_published,
                published_date: is_published ? new Date() : null,
            })
            .where(eq(blogs.id, blog_id))
            .returning();

        if (!updated) {
            return sendErrorResponse('Blog not found', 404);
        }

        revalidatePath('/blogs');
        revalidatePath('/(home)', 'page');

        return sendResponse('Blog', 'PATCH', updated);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * DELETE /api/blogs/admin - Delete a blog post (admin only).
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'admin') {
            return sendErrorResponse('Forbidden', 403);
        }

        const { searchParams } = new URL(req.url);
        const blogId = +(searchParams.get('id') || '0');

        if (!blogId) {
            return sendErrorResponse('Blog ID is required', 400);
        }

        const [deleted] = await db.delete(blogs).where(eq(blogs.id, blogId)).returning();

        if (!deleted) {
            return sendErrorResponse('Blog not found', 404);
        }

        revalidatePath('/blogs');
        revalidatePath('/(home)', 'page');

        return sendResponse('Blog', 'DELETE', deleted);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
