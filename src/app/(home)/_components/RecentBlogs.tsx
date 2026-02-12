import { desc, eq } from 'drizzle-orm';
import { Calendar, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MotionCard, SectionHeading, StaggerContainer } from '@/components/misc/animations';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/drizzle';
import { blogs } from '@/lib/drizzle/schema/blogs';
import { users } from '@/lib/drizzle/schema/users';

/**
 * Recent blog posts section on the homepage.
 */
export async function RecentBlogsSection() {
    let recentBlogs: {
        id: number;
        title: string;
        slug: string;
        excerpt: string | null;
        cover_image: string | null;
        views: number;
        published_date: Date | null;
        author: { name: string; profile_image: string | null };
    }[] = [];

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
        <section className="border-t border-border/50 bg-muted/30 py-20">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-12 flex items-center justify-between">
                    <SectionHeading subtitle="Thoughts, insights, and tutorials">
                        Latest Blog Posts
                    </SectionHeading>
                    <Button asChild variant="outline">
                        <Link href="/blogs">View All</Link>
                    </Button>
                </div>

                <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {recentBlogs.map((blog) => (
                        <MotionCard key={blog.id}>
                            <Link
                                className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                                href={`/blogs/${blog.slug}`}
                            >
                                {blog.cover_image && (
                                    <div className="aspect-video overflow-hidden bg-muted">
                                        <Image
                                            alt={blog.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            height={200}
                                            src={blog.cover_image}
                                            width={360}
                                        />
                                    </div>
                                )}
                                <div className="flex flex-1 flex-col p-5">
                                    <h3 className="mb-2 line-clamp-2 font-semibold transition-colors group-hover:text-primary">
                                        {blog.title}
                                    </h3>
                                    {blog.excerpt && (
                                        <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
                                            {blog.excerpt}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            {blog.author.profile_image && (
                                                <Image
                                                    alt={blog.author.name}
                                                    className="h-5 w-5 rounded-full object-cover"
                                                    height={20}
                                                    src={blog.author.profile_image}
                                                    width={20}
                                                />
                                            )}
                                            <span>{blog.author.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {blog.published_date && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(
                                                        blog.published_date
                                                    ).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                {blog.views}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </MotionCard>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
