'use client';

import { Calendar, Check, Eye, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from 'nhb-toolbox';
import { useState } from 'react';
import { confirmToast } from '@/components/misc/confirm';
import SmartTooltip from '@/components/misc/smart-tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { deleteFromCloudinary } from '@/lib/actions/cloudinary';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { buildCloudinaryUrl, cn } from '@/lib/utils';
import type { AdminBlog } from '@/types/blogs';

export function AdminBlogsClient({ initialData }: { initialData: AdminBlog[] }) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data: blogs = initialData } = useApiQuery<AdminBlog[]>('/api/blogs/admin', {
        queryKey: ['admin-blogs'],
    });

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
                    onSuccess: async () => {
                        if (blog.cover_image) {
                            await deleteFromCloudinary(blog.cover_image);
                        }
                    },
                    onSettled: () => setDeletingId(null),
                });
            },
        });
    };

    const publishedCount = blogs.filter((b) => b.is_published).length;
    const draftCount = blogs.filter((b) => !b.is_published).length;

    return (
        <div className="space-y-6">
            {/* Header with stats */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Blog Management</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage blog posts and publish content
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-sm">
                        <span className="font-medium">{blogs.length}</span>
                        <span className="text-muted-foreground">total</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-green-200/60 bg-green-50/50 px-3 py-1.5 text-sm dark:border-green-800/40 dark:bg-green-950/30">
                        <span className="font-medium">{publishedCount}</span>
                        <span className="text-muted-foreground">published</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-yellow-200/60 bg-yellow-50/50 px-3 py-1.5 text-sm dark:border-yellow-800/40 dark:bg-yellow-950/30">
                        <span className="font-medium">{draftCount}</span>
                        <span className="text-muted-foreground">drafts</span>
                    </div>
                </div>
            </div>

            {blogs.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground">No blog posts yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {blogs.map((blog) => (
                        <Card
                            className={cn(
                                'relative overflow-hidden transition-shadow hover:shadow-md pt-3 pb-0',
                                !blog.is_published && 'opacity-75'
                            )}
                            key={blog.id}
                        >
                            {/* Status indicator strip */}
                            <div
                                className={cn(
                                    'absolute inset-x-0 top-0 h-1',
                                    blog.is_published ? 'bg-green-500' : 'bg-yellow-500'
                                )}
                            />

                            <CardContent className="p-4 pt-5">
                                {/* Cover image */}
                                <div className="mb-3 overflow-hidden rounded-lg">
                                    {blog.cover_image ? (
                                        <Image
                                            alt={blog.title}
                                            className="h-40 w-full object-cover transition-transform hover:scale-105"
                                            height={160}
                                            src={buildCloudinaryUrl(blog.cover_image)}
                                            width={400}
                                        />
                                    ) : (
                                        <div className="flex h-40 w-full items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                                            No cover image
                                        </div>
                                    )}
                                </div>

                                {/* Blog info */}
                                <Link
                                    className="group line-clamp-2 font-semibold leading-tight text-foreground transition-colors hover:text-primary"
                                    href={`/blogs/${blog.slug}`}
                                >
                                    {blog.title}
                                </Link>

                                {/* Meta info */}
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span>by {blog.author.name}</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="size-3" />
                                        {formatDate({
                                            date: blog.created_at,
                                            format: 'mmm DD',
                                        })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Eye className="size-3" />
                                        {blog.views}
                                    </span>
                                </div>

                                {/* Status badge */}
                                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
                                    <Badge
                                        className={cn(
                                            blog.is_published
                                                ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400'
                                                : 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-400'
                                        )}
                                        variant="outline"
                                    >
                                        {blog.is_published ? 'Published' : 'Draft'}
                                    </Badge>

                                    {/* Actions */}
                                    <div className="flex gap-0.5">
                                        <SmartTooltip
                                            content={
                                                blog.is_published
                                                    ? 'Unpublish'
                                                    : 'Approve & Publish'
                                            }
                                            trigger={
                                                <Button
                                                    disabled={isToggling}
                                                    onClick={() => handleTogglePublish(blog)}
                                                    size="icon-sm"
                                                    variant="ghost"
                                                >
                                                    {blog.is_published ? (
                                                        <X className="size-4" />
                                                    ) : (
                                                        <Check className="size-4" />
                                                    )}
                                                </Button>
                                            }
                                        />
                                        <SmartTooltip
                                            content="Delete blog"
                                            trigger={
                                                <Button
                                                    disabled={
                                                        deletingId === blog.id && isDeleting
                                                    }
                                                    loading={
                                                        deletingId === blog.id && isDeleting
                                                    }
                                                    onClick={() => handleDelete(blog)}
                                                    size="icon-sm"
                                                    variant="ghost"
                                                >
                                                    {(deletingId === blog.id && isDeleting) || (
                                                        <Trash2 className="size-4 text-destructive" />
                                                    )}
                                                </Button>
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
