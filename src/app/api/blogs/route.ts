import { and, desc, eq, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { slugifyString } from 'nhb-toolbox';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { blogCategories, blogs, blogTags, categories, tags } from '@/lib/drizzle/schema/blogs';
import { users } from '@/lib/drizzle/schema/users';
import { CreateBlogSchema } from '@/lib/zod-schema/blogs';

/**
 * GET /api/blogs - Fetch all published blogs with pagination.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = Number(searchParams.get('page') || '1');
        const limit = Number(searchParams.get('limit') || '12');
        const tag = searchParams.get('tag');
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const offset = (page - 1) * limit;

        let query = db
            .select({
                id: blogs.id,
                title: blogs.title,
                slug: blogs.slug,
                excerpt: blogs.excerpt,
                cover_image: blogs.cover_image,
                views: blogs.views,
                published_date: blogs.published_date,
                created_at: blogs.created_at,
                author: {
                    id: users.id,
                    name: users.name,
                    profile_image: users.profile_image,
                },
            })
            .from(blogs)
            .innerJoin(users, eq(blogs.author_id, users.id))
            .where(eq(blogs.is_published, true))
            .orderBy(desc(blogs.published_date))
            .limit(limit)
            .offset(offset)
            .$dynamic();

        // Tag filter
        if (tag) {
            query = query
                .innerJoin(blogTags, eq(blogs.id, blogTags.blog_id))
                .innerJoin(
                    tags,
                    and(eq(blogTags.tag_id, tags.id), eq(tags.slug, tag))
                ) as typeof query;
        }

        // Category filter
        if (category) {
            query = query
                .innerJoin(blogCategories, eq(blogs.id, blogCategories.blog_id))
                .innerJoin(
                    categories,
                    and(
                        eq(blogCategories.category_id, categories.id),
                        eq(categories.slug, category)
                    )
                ) as typeof query;
        }

        // Search filter
        if (search) {
            query = query.where(
                and(
                    eq(blogs.is_published, true),
                    sql`(${blogs.title} ILIKE ${`%${search}%`} OR ${blogs.excerpt} ILIKE ${`%${search}%`})`
                )
            ) as typeof query;
        }

        const result = await query;

        return sendResponse('Blog', 'GET', result);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * POST /api/blogs - Create a new blog post.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        // Check email verification (Google users are auto-verified)
        if (!session.user.email_verified) {
            return sendErrorResponse(
                'Please verify your email before creating a blog post',
                403
            );
        }

        const body = await req.json();

        const validation = await validateRequest(CreateBlogSchema, body);

        if (!validation.success) return validation.response;

        const { title, content, cover_image, excerpt, is_published, tag_ids, category_ids } =
            validation.data;

        const slug = slugifyString(title);

        // Check for duplicate slug
        const [existing] = await db
            .select({ id: blogs.id })
            .from(blogs)
            .where(eq(blogs.slug, slug))
            .limit(1);

        if (existing) {
            return sendErrorResponse('A blog post with a similar title already exists', 409);
        }

        const [newBlog] = await db
            .insert(blogs)
            .values({
                title,
                slug,
                content,
                author_id: Number(session.user.id),
                cover_image: cover_image || null,
                excerpt: excerpt || null,
                is_published,
                published_date: is_published ? new Date() : null,
            })
            .returning();

        // Insert tag and category relations
        if (tag_ids?.length) {
            await db
                .insert(blogTags)
                .values(tag_ids.map((tag_id: number) => ({ blog_id: newBlog.id, tag_id })));
        }

        if (category_ids?.length) {
            await db.insert(blogCategories).values(
                category_ids.map((category_id: number) => ({
                    blog_id: newBlog.id,
                    category_id,
                }))
            );
        }

        return sendResponse('Blog', 'POST', newBlog);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
