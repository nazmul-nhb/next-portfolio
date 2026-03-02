import { and, desc, eq, sql } from 'drizzle-orm';
import { Calendar, Eye, PenTool, X } from 'lucide-react';
import type { Metadata, Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate, truncateString } from 'nhb-toolbox';
import {
    FadeInUp,
    MotionCard,
    SectionHeading,
    StaggerContainer,
} from '@/components/misc/animations';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/configs/site';
import { db } from '@/lib/drizzle';
import { blogCategories, blogs, blogTags, categories, tags } from '@/lib/drizzle/schema/blogs';
import { users } from '@/lib/drizzle/schema/users';
import { buildCloudinaryUrl, buildOpenGraphImages, stripHtml } from '@/lib/utils';
import type { RecentBlog } from '@/types/blogs';

export const revalidate = 60; // ISR: revalidate every minute

const description =
    'Read articles about programming, web development, technology, literature and more.';

export const metadata: Metadata = {
    title: 'Blogs',
    description,
    keywords: [...siteConfig.keywords],
    openGraph: {
        title: 'Blogs',
        description,
        images: buildOpenGraphImages(siteConfig.logoSvg, siteConfig.favicon),
    },
};

interface ParamProps {
    searchParams: Promise<{ tag?: string; category?: string; search?: string }>;
}

export default async function BlogsPage({ searchParams }: ParamProps) {
    const params = await searchParams;
    const tagFilter = params.tag;
    const categoryFilter = params.category;
    const searchFilter = params.search;

    let allBlogs: RecentBlog[] = [];

    // Fetch all categories for filter UI
    let allCategories: { id: number; title: string; slug: string }[] = [];

    try {
        allCategories = await db
            .select({ id: categories.id, title: categories.title, slug: categories.slug })
            .from(categories);

        let query = db
            .select({
                id: blogs.id,
                title: blogs.title,
                slug: blogs.slug,
                excerpt: blogs.excerpt,
                content: blogs.content,
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
            .$dynamic();

        if (tagFilter) {
            query = query
                .innerJoin(blogTags, eq(blogs.id, blogTags.blog_id))
                .innerJoin(tags, and(eq(blogTags.tag_id, tags.id), eq(tags.slug, tagFilter)));
        }

        if (categoryFilter) {
            query = query
                .innerJoin(blogCategories, eq(blogs.id, blogCategories.blog_id))
                .innerJoin(
                    categories,
                    and(
                        eq(blogCategories.category_id, categories.id),
                        eq(categories.slug, categoryFilter)
                    )
                );
        }

        if (searchFilter) {
            query = query.where(
                and(
                    eq(blogs.is_published, true),
                    sql`(${blogs.title} ILIKE ${`%${searchFilter}%`} OR ${blogs.excerpt} ILIKE ${`%${searchFilter}%`})`
                )
            );
        }

        allBlogs = await query;
    } catch (error) {
        console.error('Failed to fetch blogs:', error);
    }

    return (
        <div className="relative mx-auto max-w-6xl px-4 py-12 overflow-x-hidden">
            {/* Decorative background */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
                <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-violet-500/5 blur-3xl" />
            </div>
            <SectionHeading
                className="mb-12"
                subtitle="Articles about programming, web development, technology, literature and other topics."
            >
                Blogs
            </SectionHeading>

            {/* Active filters */}
            {(tagFilter || categoryFilter || searchFilter) && (
                <FadeInUp>
                    <div className="mb-6 flex flex-wrap items-center gap-2">
                        <span className="text-sm text-muted-foreground">Filtering by:</span>
                        {categoryFilter && (
                            <Link
                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                                href={
                                    `/blogs${tagFilter ? `?tag=${tagFilter}` : ''}${searchFilter ? `${tagFilter ? '&' : '?'}search=${searchFilter}` : ''}` as Route
                                }
                            >
                                Category: {categoryFilter}
                                <X className="h-3 w-3" />
                            </Link>
                        )}
                        {tagFilter && (
                            <Link
                                className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                                href={
                                    `/blogs${categoryFilter ? `?category=${categoryFilter}` : ''}${searchFilter ? `${categoryFilter ? '&' : '?'}search=${searchFilter}` : ''}` as Route
                                }
                            >
                                Tag: #{tagFilter}
                                <X className="h-3 w-3" />
                            </Link>
                        )}
                        {searchFilter && (
                            <Link
                                className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                                href={
                                    `/blogs${categoryFilter ? `?category=${categoryFilter}` : ''}${tagFilter ? `${categoryFilter ? '&' : '?'}tag=${tagFilter}` : ''}` as Route
                                }
                            >
                                Search: &quot;{searchFilter}&quot;
                                <X className="h-3 w-3" />
                            </Link>
                        )}
                        <Link
                            className="text-xs text-destructive hover:underline"
                            href="/blogs"
                        >
                            Clear all
                        </Link>
                    </div>
                </FadeInUp>
            )}

            {/* Category filters */}
            {allCategories.length > 0 && (
                <FadeInUp>
                    <div className="mb-6 flex flex-wrap gap-2">
                        <Link
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                !categoryFilter
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                            href={
                                `/blogs${tagFilter ? `?tag=${tagFilter}` : ''}${searchFilter ? `${tagFilter ? '&' : '?'}search=${searchFilter}` : ''}` as Route
                            }
                        >
                            All
                        </Link>
                        {allCategories.map((cat) => (
                            <Link
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                    categoryFilter === cat.slug
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                                href={`/blogs?category=${cat.slug}${tagFilter ? `&tag=${tagFilter}` : ''}${searchFilter ? `&search=${searchFilter}` : ''}`}
                                key={cat.id}
                            >
                                {cat.title}
                            </Link>
                        ))}
                    </div>
                </FadeInUp>
            )}

            <div className="mb-8 flex justify-end">
                <Button asChild>
                    <Link href="/blogs/new">
                        <PenTool className="mr-2 h-4 w-4" />
                        Write a Post
                    </Link>
                </Button>
            </div>

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
                    {allBlogs.map((blog) => {
                        return (
                            <MotionCard key={blog.id}>
                                <Link
                                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                                    href={`/blogs/${blog.slug}`}
                                >
                                    <div className="aspect-3/1 overflow-hidden bg-muted">
                                        <Image
                                            alt={blog.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            height={160}
                                            src={
                                                blog.cover_image
                                                    ? buildCloudinaryUrl(blog.cover_image)
                                                    : siteConfig.blogCover
                                            }
                                            width={400}
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col p-5">
                                        <h2 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
                                            {blog.title}
                                        </h2>
                                        <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">
                                            {blog.excerpt ||
                                                truncateString(stripHtml(blog.content), 216)}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                {blog.author.profile_image && (
                                                    <Image
                                                        alt={blog.author.name}
                                                        className="h-5 w-5 rounded-full object-cover"
                                                        height={20}
                                                        src={buildCloudinaryUrl(
                                                            blog.author.profile_image
                                                        )}
                                                        width={20}
                                                    />
                                                )}
                                                <span>{blog.author.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {blog.published_date && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate({
                                                            date: blog.published_date,
                                                            format: 'mmm DD, yyyy',
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
                        );
                    })}
                </StaggerContainer>
            )}
        </div>
    );
}
