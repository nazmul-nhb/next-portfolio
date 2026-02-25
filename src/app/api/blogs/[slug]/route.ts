import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import type { Prettify } from 'nhb-toolbox/utils/types';
import type z from 'zod';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import {
    blogCategories,
    blogReactions,
    blogs,
    blogTags,
    categories,
    comments,
    tags,
} from '@/lib/drizzle/schema/blogs';
import { users } from '@/lib/drizzle/schema/users';
import { UpdateBlogSchema } from '@/lib/zod-schema/blogs';

type Params = { params: Promise<{ slug: string }> };

/**
 * GET /api/blogs/[slug] - Get a single blog post by slug.
 */
export async function GET(_req: Request, { params }: Params) {
    try {
        const { slug } = await params;

        const [blog] = await db
            .select({
                id: blogs.id,
                title: blogs.title,
                slug: blogs.slug,
                content: blogs.content,
                cover_image: blogs.cover_image,
                excerpt: blogs.excerpt,
                is_published: blogs.is_published,
                published_date: blogs.published_date,
                views: blogs.views,
                created_at: blogs.created_at,
                updated_at: blogs.updated_at,
                author: {
                    id: users.id,
                    name: users.name,
                    profile_image: users.profile_image,
                },
            })
            .from(blogs)
            .innerJoin(users, eq(blogs.author_id, users.id))
            .where(eq(blogs.slug, slug))
            .limit(1);

        if (!blog) {
            return sendErrorResponse('Blog post not found', 404);
        }

        // Increment views
        await db
            .update(blogs)
            .set({ views: sql`${blogs.views} + 1` })
            .where(eq(blogs.id, blog.id));

        // Fetch reactions from relational table
        const reactionRows = await db
            .select({ user_id: blogReactions.user_id, type: blogReactions.type })
            .from(blogReactions)
            .where(eq(blogReactions.blog_id, blog.id));

        const reactions = {
            like: reactionRows.filter((r) => r.type === 'like').map((r) => r.user_id),
            dislike: reactionRows.filter((r) => r.type === 'dislike').map((r) => r.user_id),
        };

        // Fetch tags
        const blogTagList = await db
            .select({ id: tags.id, title: tags.title, slug: tags.slug })
            .from(blogTags)
            .innerJoin(tags, eq(blogTags.tag_id, tags.id))
            .where(eq(blogTags.blog_id, blog.id));

        // Fetch categories
        const blogCategoryList = await db
            .select({ id: categories.id, title: categories.title, slug: categories.slug })
            .from(blogCategories)
            .innerJoin(categories, eq(blogCategories.category_id, categories.id))
            .where(eq(blogCategories.blog_id, blog.id));

        // Fetch comments
        const blogComments = await db
            .select({
                id: comments.id,
                content: comments.content,
                parent_comment_id: comments.parent_comment_id,
                reactions: comments.reactions,
                created_at: comments.created_at,
                updated_at: comments.updated_at,
                author: {
                    id: users.id,
                    name: users.name,
                    profile_image: users.profile_image,
                },
            })
            .from(comments)
            .innerJoin(users, eq(comments.author_id, users.id))
            .where(eq(comments.blog_id, blog.id));

        revalidatePath('/blogs');
        revalidatePath('/(home)', 'page');

        return sendResponse('Blog', 'GET', {
            blog: { ...blog, reactions },
            tags: blogTagList,
            categories: blogCategoryList,
            comments: blogComments,
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * PATCH /api/blogs/[slug] - Update a blog post.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const { slug } = await params;

        // Find the blog
        const [blog] = await db.select().from(blogs).where(eq(blogs.slug, slug)).limit(1);

        if (!blog) {
            return sendErrorResponse('Blog post not found', 404);
        }

        // Only author or admin can update
        if (blog.author_id !== +session.user.id && session.user.role !== 'admin') {
            return sendErrorResponse('Forbidden', 403);
        }

        type UpdateBlogBody = Prettify<
            z.infer<typeof UpdateBlogSchema> & Partial<typeof blogs.$inferInsert>
        >;

        const body = (await req.json()) as UpdateBlogBody;

        const validation = await validateRequest(UpdateBlogSchema, body);

        if (!validation.success) return validation.response;

        const { tag_ids, category_ids, ...updateData } = validation.data;

        // If publishing for first time, set published_date
        if (updateData.is_published && !blog.is_published) {
            updateData.published_date = new Date();
        }

        const [updated] = await db
            .update(blogs)
            .set(updateData)
            .where(eq(blogs.id, blog.id))
            .returning();

        // Update tags
        if (tag_ids) {
            await db.delete(blogTags).where(eq(blogTags.blog_id, blog.id));
            if (tag_ids.length) {
                await db
                    .insert(blogTags)
                    .values(tag_ids.map((tag_id: number) => ({ blog_id: blog.id, tag_id })));
            }
        }

        // Update categories
        if (category_ids) {
            await db.delete(blogCategories).where(eq(blogCategories.blog_id, blog.id));
            if (category_ids.length) {
                await db.insert(blogCategories).values(
                    category_ids.map((category_id: number) => ({
                        blog_id: blog.id,
                        category_id,
                    }))
                );
            }
        }

        revalidatePath('/blogs');
        revalidatePath('/(home)', 'page');

        return sendResponse('Blog', 'PATCH', updated);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * DELETE /api/blogs/[slug] - Delete a blog post.
 */
export async function DELETE(_req: Request, { params }: Params) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const { slug } = await params;

        const [blog] = await db.select().from(blogs).where(eq(blogs.slug, slug)).limit(1);

        if (!blog) {
            return sendErrorResponse('Blog post not found', 404);
        }

        // Only author or admin can delete
        if (blog.author_id !== +session.user.id && session.user.role !== 'admin') {
            return sendErrorResponse('Forbidden', 403);
        }

        await db.delete(blogs).where(eq(blogs.id, blog.id));

        revalidatePath('/blogs');
        revalidatePath('/(home)', 'page');

        return sendResponse('Blog', 'DELETE');
    } catch (error) {
        return sendErrorResponse(error);
    }
}
