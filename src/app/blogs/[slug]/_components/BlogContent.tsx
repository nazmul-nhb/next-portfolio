'use client';

import {
    Calendar,
    Check,
    Copy,
    Edit,
    Eye,
    Share2,
    ThumbsDown,
    ThumbsUp,
    User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCopyText } from 'nhb-hooks';
import { formatDate, isBrowser } from 'nhb-toolbox';
import { useMemo, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { FaFacebook, FaWhatsapp } from 'react-icons/fa';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { FadeIn, FadeInUp } from '@/components/misc/animations';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
    const [openPopup, setOpenPopup] = useState(false);

    const { mutate: reactToBlog } = useApiMutation<unknown, { type: 'like' | 'dislike' }>(
        `/api/blogs/${blog.slug}/react`,
        'POST',
        {
            invalidateKeys: ['blog', blog.slug],
            silentSuccessMessage: true,
            onError: (error) => console.error('Reaction failed:', error),
        }
    );

    const { copiedText, copyToClipboard } = useCopyText({
        onSuccess: (msg) => toast.success(msg),
        onError: (msg) => toast.error(msg),
    });

    const sharableUrl = useMemo(() => (isBrowser() ? window.location.href : ''), []);

    const handleShareFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharableUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
        setOpenPopup(false);
    };

    const handleShareWhatsApp = () => {
        const text = `${blog.title} by ${blog.author.name} - ${sharableUrl}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setOpenPopup(false);
    };

    const handleCopyLink = () => {
        copyToClipboard(sharableUrl, 'Link copied to clipboard!', 'Failed to copy link');
    };

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
                    <div className="mb-8 overflow-hidden rounded-t-2xl">
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

                    <Popover modal onOpenChange={setOpenPopup} open={openPopup}>
                        <PopoverTrigger asChild>
                            <Button aria-label="Share this post" size="sm" variant="outline">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-56 p-3" sideOffset={8}>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Share this post
                            </p>
                            <div className="flex flex-col gap-1">
                                <button
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[#1877F2]/10 hover:text-[#1877F2]"
                                    onClick={handleShareFacebook}
                                    type="button"
                                >
                                    <FaFacebook className="size-5 shrink-0" />
                                    Share on Facebook
                                </button>
                                <button
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[#25D366]/10 hover:text-[#25D366]"
                                    onClick={handleShareWhatsApp}
                                    type="button"
                                >
                                    <FaWhatsapp className="size-5 shrink-0" />
                                    Share on WhatsApp
                                </button>
                                <div className="my-1 h-px bg-border" />
                                <button
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                                    onClick={handleCopyLink}
                                    type="button"
                                >
                                    {copiedText ? (
                                        <Fragment>
                                            <Check className="size-5 shrink-0 text-green-500" />
                                            <span className="text-green-500">Link Copied!</span>
                                        </Fragment>
                                    ) : (
                                        <Fragment>
                                            <Copy className="size-5 shrink-0" />
                                            Copy Link
                                        </Fragment>
                                    )}
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </FadeInUp>
        </div>
    );
}
