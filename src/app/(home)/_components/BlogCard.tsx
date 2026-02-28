'use client';

import { Calendar, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMount } from 'nhb-hooks';
import { formatDate } from 'nhb-toolbox';
import { MotionCard } from '@/components/misc/animations';
import UserAvatar from '@/components/misc/user-avatar';
import { buildCloudinaryUrl } from '@/lib/utils';
import type { RecentBlog } from '@/types/blogs';

type Props = {
    blog: RecentBlog;
};

export default function BlogCard({ blog }: Props) {
    return useMount(
        <MotionCard>
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
                            loading="eager"
                            src={buildCloudinaryUrl(blog.cover_image)}
                            width={360}
                        />
                    </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 line-clamp-2 font-semibold transition-colors group-hover:text-primary">
                        {blog.title}
                    </h3>
                    {blog.excerpt && (
                        <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
                            {blog.excerpt}
                        </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <UserAvatar
                                className="size-5"
                                image={blog.author.profile_image}
                                name={blog.author.name}
                            />
                            <span>{blog.author.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {blog.published_date && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate({
                                        date: blog.published_date,
                                        format: 'dd, mmm DD, YYYY',
                                    })}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {blog.views}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </MotionCard>
    );
}
