'use client';

import { Calendar, Edit, Eye, PenTool, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTitle } from 'nhb-hooks';
import { formatDate, truncateString } from 'nhb-toolbox';
import { useEffect } from 'react';
import {
    FadeInUp,
    MotionCard,
    SectionHeading,
    StaggerContainer,
} from '@/components/misc/animations';
import { MyBlogsSkeleton } from '@/components/misc/skeletons';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/configs/site';
import { useApiQuery } from '@/lib/hooks/use-api';
import { buildCloudinaryUrl, stripHtml } from '@/lib/utils';

interface MyBlog {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    cover_image: string | null;
    is_published: boolean;
    published_date: string | null;
    views: number;
    created_at: string;
}

export default function MyBlogsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useTitle(`My Blogs » ${siteConfig.name}`);

    const { data: blogs, isLoading } = useApiQuery<MyBlog[]>('/api/blogs/my', {
        enabled: status === 'authenticated',
        queryKey: ['my-blogs'],
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    if (status === 'loading' || isLoading) return <MyBlogsSkeleton />;

    if (!session?.user) return null;

    return (
        <div className="relative mx-auto max-w-6xl px-4 py-12 overflow-x-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 left-1/4 size-72 rounded-full bg-blue-500/5 blur-3xl" />
                <div className="absolute -bottom-24 right-1/4 size-72 rounded-full bg-violet-500/5 blur-3xl" />
            </div>

            <SectionHeading className="mb-12" subtitle="Manage your own blog posts.">
                My Blogs
            </SectionHeading>

            <div className="mb-8 flex justify-end">
                <Button asChild>
                    <Link href="/blogs/new">
                        <Plus className="mr-2 size-4" />
                        Write a Post
                    </Link>
                </Button>
            </div>

            {!blogs || blogs.length === 0 ? (
                <FadeInUp>
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <PenTool className="mb-4 size-12 text-muted-foreground/50" />
                        <h2 className="mb-2 text-xl font-semibold">No blog posts yet</h2>
                        <p className="mb-6 text-muted-foreground">
                            Start sharing your thoughts with the world!
                        </p>
                        <Button asChild>
                            <Link href="/blogs/new">Start Writing</Link>
                        </Button>
                    </div>
                </FadeInUp>
            ) : (
                <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {blogs.map((blog) => (
                        <MotionCard key={blog.id}>
                            <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                                <Link href={`/blogs/${blog.slug}`}>
                                    <div className="aspect-3/1 overflow-hidden bg-muted">
                                        <Image
                                            alt={blog.title}
                                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            height={100}
                                            src={
                                                blog.cover_image
                                                    ? buildCloudinaryUrl(blog.cover_image)
                                                    : siteConfig.blogCover
                                            }
                                            width={400}
                                        />
                                    </div>
                                </Link>
                                <div className="flex flex-1 flex-col p-5">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Link
                                            className="line-clamp-2 flex-1 text-lg font-semibold transition-colors group-hover:text-primary"
                                            href={`/blogs/${blog.slug}`}
                                        >
                                            {blog.title}
                                        </Link>
                                        <span
                                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                                                blog.is_published
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}
                                        >
                                            {blog.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                    <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">
                                        {blog.excerpt ||
                                            truncateString(stripHtml(blog.content), 216)}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="size-3" />
                                            {formatDate({
                                                date: blog.published_date || blog.created_at,
                                                format: 'mmm DD, yyyy',
                                            })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="size-3" />
                                            {blog.views}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <Button
                                            asChild
                                            className="gap-1.5"
                                            size="sm"
                                            variant="outline"
                                        >
                                            <Link href={`/blogs/${blog.slug}/edit`}>
                                                <Edit className="size-3" />
                                                Edit
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </MotionCard>
                    ))}
                </StaggerContainer>
            )}
        </div>
    );
}
