import { desc, eq } from 'drizzle-orm';
import { Calendar, Eye, PenTool } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FadeInUp, ScaleInItem, StaggerContainer } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/drizzle';
import { blogs } from '@/lib/drizzle/schema/blogs';
import { users } from '@/lib/drizzle/schema/users';

export const revalidate = 600; // ISR: revalidate every 10 minutes

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Read articles about web development, technology, and more.',
};

export default async function BlogsPage() {
    let allBlogs: {
        id: number;
        title: string;
        slug: string;
        excerpt: string | null;
        cover_image: string | null;
        views: number;
        published_date: Date | null;
        author: { id: number; name: string; profile_image: string | null };
    }[] = [];

    try {
        allBlogs = await db
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
            .orderBy(desc(blogs.published_date));
    } catch (error) {
        console.error('Failed to fetch blogs:', error);
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-12">
            <FadeInUp>
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="mb-3 text-4xl font-bold tracking-tight">Blog</h1>
                        <p className="text-lg text-muted-foreground">
                            Articles about web development, technology, and other topics.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/blogs/new">
                            <PenTool className="mr-2 h-4 w-4" />
                            Write a Post
                        </Link>
                    </Button>
                </div>
            </FadeInUp>

            {allBlogs.length === 0 ? (
                <FadeInUp>
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <PenTool className="mb-4 h-12 w-12 text-muted-foreground/50" />
                        <h2 className="mb-2 text-xl font-semibold">No blog posts yet</h2>
                        <p className="mb-6 text-muted-foreground">
                            Be the first to write a blog post!
                        </p>
                        <Button asChild>
                            <Link href="/blogs/new">Start Writing</Link>
                        </Button>
                    </div>
                </FadeInUp>
            ) : (
                <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {allBlogs.map((blog) => (
                        <ScaleInItem key={blog.id}>
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
                                    <h2 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
                                        {blog.title}
                                    </h2>
                                    {blog.excerpt && (
                                        <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">
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
                                                        year: 'numeric',
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
                        </ScaleInItem>
                    ))}
                </StaggerContainer>
            )}
        </div>
    );
}
