'use client';

import { Calendar, Edit, Eye, ThumbsDown, ThumbsUp, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatDate } from 'nhb-toolbox';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { FadeIn, FadeInUp } from '@/components/misc/animations';
import { Button } from '@/components/ui/button';
import { httpRequest } from '@/lib/actions/baseRequest';
import { buildCloudinaryUrl } from '@/lib/utils';
import type { BlogCategory, BlogDetails, BlogTag } from '@/types/blogs';

interface BlogContentProps {
    blog: BlogDetails;
    tags: BlogTag[];
    categories: BlogCategory[];
}

/**
 * Blog post content with markdown rendering and reaction buttons.
 */
export function BlogContent({ blog, tags, categories }: BlogContentProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const reactions = blog.reactions || {};
    const likes = reactions.like || [];
    const dislikes = reactions.dislike || [];

    const handleReact = async (type: 'like' | 'dislike') => {
        if (!session?.user) {
            router.push('/auth/login');
            return;
        }

        try {
            await httpRequest(`/api/blogs/${blog.slug}/react`, {
                method: 'POST',
                body: { type },
            });
            router.refresh();
        } catch (error) {
            console.error('Reaction failed:', error);
        }
    };

    return (
        <div>
            <FadeIn>
                {blog.cover_image && (
                    <div className="mb-8 overflow-hidden rounded-2xl">
                        <Image
                            alt={blog.title}
                            className="h-auto w-full object-cover"
                            height={400}
                            src={buildCloudinaryUrl(blog.cover_image)}
                            width={800}
                        />
                    </div>
                )}
            </FadeIn>

            <FadeInUp>
                <div className="mb-8">
                    {/* Categories */}
                    {categories.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <Link
                                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                                    href={`/blogs?category=${cat.slug}`}
                                    key={cat.id}
                                >
                                    {cat.title}
                                </Link>
                            ))}
                        </div>
                    )}

                    <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        {blog.title}
                    </h1>

                    {/* Edit button - visible to author and admin */}
                    {session?.user &&
                        (blog.author.id === +session.user.id ||
                            session.user.role === 'admin') && (
                            <div className="mb-4">
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/blogs/${blog.slug}/edit`}>
                                        <Edit className="mr-2 h-3.5 w-3.5" />
                                        Edit Post
                                    </Link>
                                </Button>
                            </div>
                        )}

                    {/* Author & meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <Link
                            className="flex items-center gap-2 hover:text-foreground"
                            href={`/users/${blog.author.id}`}
                        >
                            {blog.author.profile_image ? (
                                <Image
                                    alt={blog.author.name}
                                    className="h-8 w-8 rounded-full object-cover"
                                    height={32}
                                    src={buildCloudinaryUrl(blog.author.profile_image)}
                                    width={32}
                                />
                            ) : (
                                <User className="h-8 w-8 rounded-full bg-muted p-1.5" />
                            )}
                            <span className="font-medium">{blog.author.name}</span>
                        </Link>

                        {blog.published_date && (
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate({
                                    date: blog.published_date,
                                    format: 'dd, mmm DD, YYYY hh:mm:ss a',
                                })}
                            </span>
                        )}

                        <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {blog.views} views
                        </span>
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <Link
                                    className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                                    href={`/blogs?tag=${tag.slug}`}
                                    key={tag.id}
                                >
                                    #{tag.title}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </FadeInUp>

            {/* Blog content - Markdown rendered */}
            <FadeInUp delay={0.2}>
                <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                    <Markdown
                        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
                        remarkPlugins={[remarkGfm]}
                    >
                        {blog.content}
                    </Markdown>
                </div>
            </FadeInUp>

            {/* Reactions */}
            <FadeInUp delay={0.3}>
                <div className="mt-10 flex items-center gap-4 border-t border-border pt-6">
                    <Button
                        className="gap-2"
                        onClick={() => handleReact('like')}
                        size="sm"
                        variant={
                            session?.user && likes.includes(+session.user.id)
                                ? 'default'
                                : 'outline'
                        }
                    >
                        <ThumbsUp className="h-4 w-4" />
                        {likes.length}
                    </Button>
                    <Button
                        className="gap-2"
                        onClick={() => handleReact('dislike')}
                        size="sm"
                        variant={
                            session?.user && dislikes.includes(+session.user.id)
                                ? 'destructive'
                                : 'outline'
                        }
                    >
                        <ThumbsDown className="h-4 w-4" />
                        {dislikes.length}
                    </Button>
                </div>
            </FadeInUp>
        </div>
    );
}
