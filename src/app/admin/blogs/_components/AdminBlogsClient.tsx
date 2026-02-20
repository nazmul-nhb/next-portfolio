'use client';

import { Calendar, Check, Eye, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { confirmToast } from '@/components/confirm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { buildCloudinaryUrl } from '@/lib/utils';

interface AdminBlog {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image: string | null;
    is_published: boolean;
    published_date: string | Date | null;
    views: number;
    created_at: string | Date;
    author: {
        id: number;
        name: string;
        email: string;
        profile_image: string | null;
    };
}

export function AdminBlogsClient({ initialData }: { initialData: AdminBlog[] }) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data: blogs } = useApiQuery<AdminBlog[]>('admin-blogs', '/api/blogs/admin');
    const allBlogs = blogs ?? initialData;

    const { mutate: togglePublish, isPending: isToggling } = useApiMutation<
        unknown,
        { blog_id: number; is_published: boolean }
    >('/api/blogs/admin', 'PATCH', {
        successMessage: 'Blog status updated!',
        errorMessage: 'Failed to update blog status.',
        invalidateKeys: ['admin-blogs'],
    });

    const { mutate: deleteBlog, isPending: isDeleting } = useApiMutation<unknown, null>(
        `/api/blogs/admin?id=${deletingId}`,
        'DELETE',
        {
            successMessage: 'Blog deleted!',
            errorMessage: 'Failed to delete blog.',
            invalidateKeys: ['admin-blogs'],
        }
    );

    const handleTogglePublish = (blog: AdminBlog) => {
        togglePublish({
            blog_id: blog.id,
            is_published: !blog.is_published,
        });
    };

    const handleDelete = (blog: AdminBlog) => {
        setDeletingId(blog.id);

        confirmToast({
            title: `Delete "${blog.title}"?`,
            description: 'This will permanently delete the blog post and all its comments.',
            confirmText: 'Delete',
            isLoading: deletingId === blog.id && isDeleting,
            onConfirm: () => {
                deleteBlog(null, {
                    onSettled: () => setDeletingId(null),
                });
            },
        });
    };

    const publishedCount = allBlogs.filter((b) => b.is_published).length;
    const draftCount = allBlogs.filter((b) => !b.is_published).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Blog Management</h1>
                <p className="text-muted-foreground">
                    {allBlogs.length} total &middot; {publishedCount} published &middot;{' '}
                    {draftCount} drafts
                </p>
            </div>

            {allBlogs.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground">No blog posts yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {allBlogs.map((blog) => (
                        <Card key={blog.id}>
                            <CardContent className="flex items-center gap-4 p-4">
                                {/* Cover thumbnail */}
                                {blog.cover_image ? (
                                    <Image
                                        alt={blog.title}
                                        className="h-16 w-24 shrink-0 rounded-lg object-cover"
                                        height={64}
                                        src={buildCloudinaryUrl(blog.cover_image)}
                                        width={96}
                                    />
                                ) : (
                                    <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                                        No image
                                    </div>
                                )}

                                {/* Blog info */}
                                <div className="min-w-0 flex-1">
                                    <Link
                                        className="line-clamp-1 font-semibold hover:text-primary"
                                        href={`/blogs/${blog.slug}`}
                                    >
                                        {blog.title}
                                    </Link>
                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        <span>by {blog.author.name}</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(blog.created_at).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {blog.views}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                blog.is_published
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}
                                        >
                                            {blog.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex shrink-0 gap-1">
                                    <Button
                                        disabled={isToggling}
                                        onClick={() => handleTogglePublish(blog)}
                                        size="sm"
                                        title={
                                            blog.is_published
                                                ? 'Unpublish'
                                                : 'Approve & Publish'
                                        }
                                        variant={blog.is_published ? 'outline' : 'default'}
                                    >
                                        {blog.is_published ? (
                                            <>
                                                <X className="mr-1 h-3 w-3" />
                                                Unpublish
                                            </>
                                        ) : (
                                            <>
                                                <Check className="mr-1 h-3 w-3" />
                                                Approve
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        disabled={deletingId === blog.id && isDeleting}
                                        loading={deletingId === blog.id && isDeleting}
                                        onClick={() => handleDelete(blog)}
                                        size="sm"
                                        variant="outline"
                                    >
                                        {(deletingId === blog.id && isDeleting) || (
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
