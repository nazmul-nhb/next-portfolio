import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import BlogCard from '@/app/(home)/_components/BlogCard';
import { SectionHeading, StaggerContainer } from '@/components/misc/animations';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/drizzle';
import { blogs } from '@/lib/drizzle/schema/blogs';
import { users } from '@/lib/drizzle/schema/users';
import type { RecentBlog } from '@/types/blogs';

/**
 * Recent blog posts section on the homepage.
 */
export async function RecentBlogsSection() {
    let recentBlogs: RecentBlog[] = [];

    try {
        recentBlogs = await db
            .select({
                id: blogs.id,
                title: blogs.title,
                slug: blogs.slug,
                excerpt: blogs.excerpt,
                cover_image: blogs.cover_image,
                views: blogs.views,
                published_date: blogs.published_date,
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
            .limit(3);
    } catch (error) {
        console.error('Failed to fetch recent blogs:', error);
    }

    if (!recentBlogs.length) return null;

    return (
        <section className="border-t border-border/50 bg-muted/30 py-8 sm:py-14 md:py-20">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-12 flex items-center justify-between">
                    <SectionHeading subtitle="Thoughts, insights, and tutorials">
                        Latest Blog Posts
                    </SectionHeading>

                    <Link href="/blogs">
                        <Button variant="outline">View All </Button>
                    </Link>
                </div>

                <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {recentBlogs.map((blog) => (
                        <BlogCard blog={blog} key={blog.id} />
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
