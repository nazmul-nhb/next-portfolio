import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { db } from '@/lib/drizzle';
import { blogs } from '@/lib/drizzle/schema/blogs';
import { users } from '@/lib/drizzle/schema/users';
import type { AdminBlog } from '@/types/blogs';
import { AdminBlogsClient } from './_components/AdminBlogsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Manage Blogs » Admin Dashboard',
};

export default async function AdminBlogsPage() {
    let allBlogs: AdminBlog[] = [];

    try {
        allBlogs = await db
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
    } catch (error) {
        console.error('Error fetching blogs:', error);
    }

    return <AdminBlogsClient initialData={allBlogs} />;
}
