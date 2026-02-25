'use client';

import { Calendar, Edit, Eye, ThumbsDown, ThumbsUp, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from 'nhb-toolbox';
import { useState } from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { FadeIn, FadeInUp } from '@/components/misc/animations';
import { Button } from '@/components/ui/button';
import { useApiMutation } from '@/lib/hooks/use-api';
import { useUserStore } from '@/lib/store/user-store';
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
    const { profile } = useUserStore();
    const router = useRouter();
    const reactions = blog.reactions || {};
    const [likes, setLikes] = useState(new Set(reactions.like));
    const [dislikes, setDislikes] = useState(new Set(reactions.dislike));

    const { mutate: reactToBlog } = useApiMutation<unknown, { type: 'like' | 'dislike' }>(
        `/api/blogs/${blog.slug}/react`,
        'POST',
        {
            invalidateKeys: ['blog', blog.slug],
            silentSuccessMessage: true,
            onError: (error) => console.error('Reaction failed:', error),
        }
    );

    const handleReact = (type: 'like' | 'dislike') => {
        if (!profile) {
            router.push(`/auth/login?redirectTo=/blogs/${blog.slug}`);
            return;
        }

        // Optimistically update UI
        if (type === 'like') {
            setLikes((prev) => {
                const next = new Set(prev);
                if (next.has(profile.id)) {
                    next.delete(profile.id);
                } else {
                    next.add(profile.id);
                    setDislikes((d) => {
                        const nd = new Set(d);
                        nd.delete(profile.id);
                        return nd;
                    });
                }
                return next;
            });
        }

        if (type === 'dislike') {
            setDislikes((prev) => {
                const next = new Set(prev);
                if (next.has(profile.id)) {
                    next.delete(profile.id);
                } else {
                    next.add(profile.id);
                    setLikes((l) => {
                        const nl = new Set(l);
                        nl.delete(profile.id);
                        return nl;
                    });
                }
                return next;
            });
        }

        reactToBlog({ type });
    };

    return (
        <div>
            <FadeIn>
                {blog.cover_image && (
                    <div className="mb-8 overflow-hidden rounded-2xl">
                        <Image
                            alt={blog.title}
                            className="aspect-3/1 object-cover"
                            height={400}
                            src={buildCloudinaryUrl(blog.cover_image)}
                            width={1200}
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
                    {profile && (blog.author.id === profile.id || profile.role === 'admin') && (
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
                        variant={profile && likes.has(profile.id) ? 'default' : 'outline'}
                    >
                        <ThumbsUp className="h-4 w-4" />
                        {likes.size}
                    </Button>
                    <Button
                        className="gap-2"
                        onClick={() => handleReact('dislike')}
                        size="sm"
                        variant={
                            profile && dislikes.has(profile.id) ? 'destructive' : 'outline'
                        }
                    >
                        <ThumbsDown className="h-4 w-4" />
                        {dislikes.size}
                    </Button>
                </div>
            </FadeInUp>
        </div>
    );
}
