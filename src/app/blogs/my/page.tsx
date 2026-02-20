'use client';

import { Calendar, Eye, PenTool, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import {
    FadeInUp,
    MotionCard,
    SectionHeading,
    StaggerContainer,
} from '@/components/misc/animations';
import { Button } from '@/components/ui/button';
import { useApiQuery } from '@/lib/hooks/use-api';
import { buildCloudinaryUrl } from '@/lib/utils';

interface MyBlog {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image: string | null;
    is_published: boolean;
    published_date: string | null;
    views: number;
    created_at: string;
}

export default function MyBlogsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const { data: blogs, isLoading } = useApiQuery<MyBlog[]>('my-blogs', '/api/blogs/my', {
        enabled: status === 'authenticated',
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    if (status === 'loading' || isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!session?.user) return null;

    return (
        <div className="relative mx-auto max-w-6xl px-4 py-12">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
                <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-violet-500/5 blur-3xl" />
            </div>

            <SectionHeading className="mb-12" subtitle="Manage your own blog posts.">
                My Blogs
            </SectionHeading>

            <div className="mb-8 flex justify-end">
                <Button asChild>
                    <Link href="/blogs/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Write a Post
                    </Link>
                </Button>
            </div>

            {!blogs || blogs.length === 0 ? (
                <FadeInUp>
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <PenTool className="mb-4 h-12 w-12 text-muted-foreground/50" />
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
                                            src={buildCloudinaryUrl(blog.cover_image)}
                                            width={360}
                                        />
                                    </div>
                                )}
                                <div className="flex flex-1 flex-col p-5">
                                    <div className="mb-2 flex items-center gap-2">
                                        <h2 className="line-clamp-2 flex-1 text-lg font-semibold transition-colors group-hover:text-primary">
                                            {blog.title}
                                        </h2>
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
                                    {blog.excerpt && (
                                        <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">
                                            {blog.excerpt}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(blog.created_at).toLocaleDateString(
                                                'en-US',
                                                {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                }
                                            )}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {blog.views}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </MotionCard>
                    ))}
                </StaggerContainer>
            )}
        </div>
    );
}
