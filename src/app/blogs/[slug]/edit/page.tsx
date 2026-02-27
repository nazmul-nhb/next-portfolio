'use client';

import { ArrowLeft, Save, Upload } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FadeInUp } from '@/components/misc/animations';
import { BlogEditor } from '@/components/misc/blog-editor';
import { BlogEditorSkeleton } from '@/components/misc/skeletons';
import { TagCategorySelector } from '@/components/misc/tag-category-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    deleteFromCloudinary,
    deleteOldCloudFile,
    uploadToCloudinary,
} from '@/lib/actions/cloudinary';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { buildCloudinaryUrl } from '@/lib/utils';
import type { SingleBlogRes } from '@/types/blogs';

/**
 * Blog post edit page – loads existing blog data and allows updating.
 */
export default function EditBlogPage() {
    const { slug } = useParams<{ slug: string }>();
    const { data: session, status } = useSession();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [publicId, setPublicId] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [tagIds, setTagIds] = useState<number[]>([]);
    const [categoryIds, setCategoryIds] = useState<number[]>([]);

    const {
        data: blogData,
        isLoading,
        isError,
    } = useApiQuery<SingleBlogRes>(`/api/blogs/${slug}`, {
        enabled: status === 'authenticated' && !!slug,
        queryKey: ['blog', slug],
    });

    const { mutate: updateBlog, isPending } = useApiMutation<
        { slug: string },
        Record<string, unknown>
    >(`/api/blogs/${slug}`, 'PATCH', {
        successMessage: 'Blog post updated!',
        invalidateKeys: ['blog', blogData?.blog?.slug, 'blogs'],
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (isError) {
            toast.error('Failed to load blog post.');
            router.push('/blogs/my');
        }
    }, [isError, router]);

    // Initialize form state from fetched blog data
    useEffect(() => {
        if (!blogData) return;

        const { blog, tags, categories } = blogData;

        // Check ownership
        if (blog.author.id !== +(session?.user?.id ?? 0) && session?.user?.role !== 'admin') {
            toast.error('You can only edit your own posts.');
            router.push(`/blogs/${slug}`);
            return;
        }

        setTitle(blog.title);
        setContent(blog.content);
        setExcerpt(blog.excerpt ?? '');
        setCoverImage(blog.cover_image ?? '');
        setIsPublished(blog.is_published);
        setTagIds(tags.map((t) => t.id));
        setCategoryIds(categories.map((c) => c.id));
    }, [blogData, session, slug, router]);

    if (status === 'loading' || isLoading) return <BlogEditorSkeleton />;

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

        let finalCoverImage = coverImage;

        try {
            if (pendingCoverFile) {
                setUploadingCover(true);
                const { public_id, url } = await uploadToCloudinary(
                    pendingCoverFile,
                    'blog-covers'
                );
                setPublicId(public_id);
                finalCoverImage = url;
                setCoverImage(finalCoverImage);
                setPendingCoverFile(null);
                setCoverPreview(null);
                setUploadingCover(false);
            }
        } catch {
            toast.error('Failed to upload image. Please try again.');
            setUploadingCover(false);
            return;
        }

        updateBlog(
            {
                title,
                content,
                excerpt: excerpt || undefined,
                cover_image: finalCoverImage || undefined,
                is_published: isPublished,
                tag_ids: tagIds,
                category_ids: categoryIds,
            },
            {
                onSuccess: async (data) => {
                    await deleteOldCloudFile(blogData?.blog?.cover_image, finalCoverImage);
                    router.push(
                        data?.data?.slug ? `/blogs/${data?.data.slug}` : `/blogs/${slug}`
                    );
                },

                onError: async () => {
                    if (publicId) await deleteFromCloudinary(publicId);
                },
            }
        );
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-12">
            <FadeInUp>
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild size="icon" variant="ghost">
                            <Link href={`/blogs/${slug}`}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">Edit Post</h1>
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
                                    <Upload className="size-4 animate-pulse" />
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
                                        Preview
                                    </div>
                                </div>
                            )}
                            {!coverPreview && coverImage && !uploadingCover && (
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                    <Image
                                        alt="Cover preview"
                                        className="object-cover"
                                        fill
                                        src={buildCloudinaryUrl(coverImage)}
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

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <Label>Tags (optional)</Label>
                            <div className="mt-1.5">
                                <TagCategorySelector
                                    allowCreate
                                    endpoint="/api/tags"
                                    label="Tags"
                                    onChange={setTagIds}
                                    placeholder="Search or create tags..."
                                    selectedIds={tagIds}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Categories (optional)</Label>
                            <div className="mt-1.5">
                                <TagCategorySelector
                                    endpoint="/api/categories"
                                    label="Categories"
                                    onChange={setCategoryIds}
                                    placeholder="Search categories..."
                                    selectedIds={categoryIds}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-6">
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <input
                                checked={isPublished}
                                className="size-4 rounded border-border accent-primary"
                                onChange={(e) => setIsPublished(e.target.checked)}
                                type="checkbox"
                            />
                            Published
                        </label>

                        <Button
                            disabled={
                                !title.trim() || !content.trim() || isPending || uploadingCover
                            }
                            loading={isPending || uploadingCover}
                            onClick={handleSubmit}
                        >
                            <Save className="size-4 mb-px" />
                            Update Post
                        </Button>
                    </div>
                </div>
            </FadeInUp>
        </div>
    );
}
