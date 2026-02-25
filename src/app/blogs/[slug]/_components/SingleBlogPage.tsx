'use client';

import { notFound } from 'next/navigation';
import { BlogContent } from '@/app/blogs/[slug]/_components/BlogContent';
import { CommentSection } from '@/app/blogs/[slug]/_components/CommentSection';
import Loading from '@/components/loading';
import { useApiQuery } from '@/lib/hooks/use-api';
import type { SingleBlogRes } from '@/types/blogs';

type Props = {
    slug: string;
};

export default function SingleBlogPage({ slug }: Props) {
    const { data, isLoading } = useApiQuery<SingleBlogRes>(`/api/blogs/${slug}`, {
        queryKey: ['blog', slug],
    });

    if (isLoading) return <Loading />;

    if (!data) return notFound();

    return (
        <article className="mx-auto max-w-4xl px-4 py-12">
            <BlogContent blog={data.blog} categories={data.categories} tags={data.tags} />
            <CommentSection blogId={data.blog.id} blogSlug={slug} comments={data.comments} />
        </article>
    );
}
