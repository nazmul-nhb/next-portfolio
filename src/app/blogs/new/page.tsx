'use client';

import { ArrowLeft, Eye, Save, Upload } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { FadeInUp } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ENV } from '@/configs/env';
import { httpRequest } from '@/lib/actions/baseRequest';
import { uploadToCloudinary } from '@/lib/actions/cloudinary';

/**
 * Blog post editor with markdown preview.
 */
export default function NewBlogPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [uploadingCover, setUploadingCover] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!session?.user) return null;

    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingCover(true);
        try {
            const result = await uploadToCloudinary(file, 'blog-covers');
            const cloudinaryPath = result.url.split('/upload/')[1];
            setCoverImage(cloudinaryPath);
            toast.success('Cover image uploaded successfully');
        } catch (error) {
            console.error('Failed to upload cover image:', error);
            toast.error('Failed to upload cover image. Please try again.');
        } finally {
            setUploadingCover(false);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) return;

        setSubmitting(true);
        try {
            const { data } = await httpRequest<{ slug: string }, Record<string, unknown>>(
                '/api/blogs',
                {
                    method: 'POST',
                    body: {
                        title,
                        content,
                        excerpt: excerpt || undefined,
                        cover_image: coverImage || undefined,
                        is_published: isPublished,
                    },
                }
            );

            if (data?.slug) {
                router.push(`/blogs/${data.slug}`);
            } else {
                router.push('/blogs');
            }
        } catch (error) {
            console.error('Failed to create blog:', error);
            toast.error('Failed to create blog. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-12">
            <FadeInUp>
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild size="icon" variant="ghost">
                            <Link href="/blogs">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">Write a New Post</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setIsPreview(!isPreview)}
                            size="sm"
                            variant="outline"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            {isPreview ? 'Edit' : 'Preview'}
                        </Button>
                    </div>
                </div>
            </FadeInUp>

            <FadeInUp delay={0.1}>
                <div className="space-y-6">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            className="mt-1.5 text-lg font-semibold"
                            id="title"
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Your blog post title..."
                            value={title}
                        />
                    </div>

                    <div>
                        <Label htmlFor="excerpt">Excerpt (optional)</Label>
                        <Input
                            className="mt-1.5"
                            id="excerpt"
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="A short summary of your post..."
                            value={excerpt}
                        />
                    </div>

                    <div>
                        <Label htmlFor="cover">Cover Image (optional)</Label>
                        <div className="mt-1.5 space-y-3">
                            <Input
                                accept="image/*"
                                className="cursor-pointer"
                                disabled={uploadingCover}
                                id="cover"
                                onChange={handleCoverImageUpload}
                                type="file"
                            />
                            {uploadingCover && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Upload className="h-4 w-4 animate-pulse" />
                                    Uploading cover image...
                                </div>
                            )}
                            {coverImage && !uploadingCover && (
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                    <Image
                                        alt="Cover preview"
                                        className="object-cover"
                                        fill
                                        src={`${ENV.cloudinary.urls.base_url}${coverImage}`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="mb-1.5 flex items-center justify-between">
                            <Label htmlFor="content">
                                Content {isPreview ? '(Preview)' : '(Markdown supported)'}
                            </Label>
                            <span className="text-xs text-muted-foreground">
                                Supports GitHub Flavored Markdown
                            </span>
                        </div>

                        {isPreview ? (
                            <div className="min-h-100 rounded-md border border-border bg-card p-6 prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5">
                                {content ? (
                                    <Markdown
                                        rehypePlugins={[
                                            rehypeRaw,
                                            rehypeSanitize,
                                            rehypeHighlight,
                                        ]}
                                        remarkPlugins={[remarkGfm]}
                                    >
                                        {content}
                                    </Markdown>
                                ) : (
                                    <p className="text-muted-foreground">
                                        Nothing to preview yet...
                                    </p>
                                )}
                            </div>
                        ) : (
                            <Textarea
                                className="mt-1.5 min-h-100 resize-y font-mono text-sm"
                                id="content"
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your blog post in markdown..."
                                value={content}
                            />
                        )}
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-6">
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <input
                                checked={isPublished}
                                className="h-4 w-4 rounded border-border accent-primary"
                                onChange={(e) => setIsPublished(e.target.checked)}
                                type="checkbox"
                            />
                            Publish immediately
                        </label>

                        <Button
                            disabled={!title.trim() || !content.trim() || submitting}
                            onClick={handleSubmit}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {submitting ? 'Saving...' : isPublished ? 'Publish' : 'Save Draft'}
                        </Button>
                    </div>
                </div>
            </FadeInUp>
        </div>
    );
}
