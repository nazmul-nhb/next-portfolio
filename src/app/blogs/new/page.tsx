'use client';

import { ArrowLeft, Save, Upload } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FadeInUp } from '@/components/animations';
import { BlogEditor } from '@/components/blog-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ENV } from '@/configs/env';
import { httpRequest } from '@/lib/actions/baseRequest';
import { uploadToCloudinary } from '@/lib/actions/cloudinary';

/**
 * Blog post editor with rich text editor.
 */
export default function NewBlogPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [uploadingCover, setUploadingCover] = useState(false);
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

    const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPendingCoverFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setCoverPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) return;

        setSubmitting(true);
        try {
            let finalCoverImage = coverImage;

            // Upload cover image if pending
            if (pendingCoverFile) {
                setUploadingCover(true);
                const result = await uploadToCloudinary(pendingCoverFile, 'blog-covers');
                finalCoverImage = result.url.split('/upload/')[1];
                setCoverImage(finalCoverImage);
                setPendingCoverFile(null);
                setCoverPreview(null);
                setUploadingCover(false);
            }

            const { data } = await httpRequest<{ slug: string }, Record<string, unknown>>(
                '/api/blogs',
                {
                    method: 'POST',
                    body: {
                        title,
                        content,
                        excerpt: excerpt || undefined,
                        cover_image: finalCoverImage || undefined,
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
                            {coverPreview && (
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                    <Image
                                        alt="Cover preview"
                                        className="object-cover"
                                        fill
                                        src={coverPreview}
                                    />
                                    <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                                        Will upload on submit
                                    </div>
                                </div>
                            )}
                            {!coverPreview && coverImage && !uploadingCover && (
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
                        <div className="mb-1.5">
                            <Label htmlFor="content">Content</Label>
                        </div>
                        <BlogEditor
                            content={content}
                            onChange={setContent}
                            placeholder="Start writing your blog post..."
                        />
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
