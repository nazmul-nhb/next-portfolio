import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { truncateString } from 'nhb-toolbox';
import { BlogContent } from '@/app/blogs/[slug]/_components/BlogContent';
import { CommentSection } from '@/app/blogs/[slug]/_components/CommentSection';
import { siteConfig } from '@/configs/site';
import { httpRequest } from '@/lib/actions/baseRequest';
import { db } from '@/lib/drizzle';
import { blogs } from '@/lib/drizzle/schema/blogs';
import { buildCloudinaryUrl } from '@/lib/utils';
import type { SingleBlogRes } from '@/types/blogs';

export async function generateMetadata({
    params,
}: PageProps<'/blogs/[slug]'>): Promise<Metadata> {
    const { slug } = await params;

    try {
        const [blog] = await db
            .select({
                title: blogs.title,
                excerpt: blogs.excerpt,
                cover_image: blogs.cover_image,
                content: blogs.content,
            })
            .from(blogs)
            .where(eq(blogs.slug, slug))
            .limit(1);

        if (!blog) return { title: 'Blog Not Found' };

        return {
            title: blog.title,
            description: blog.excerpt || truncateString(blog.content, 160),
            openGraph: {
                title: blog.title,
                description: blog.excerpt || undefined,
                images: blog.cover_image
                    ? buildCloudinaryUrl(blog.cover_image)
                    : [siteConfig.favicon, siteConfig.logoSvg],
            },
        };
    } catch (error) {
        console.error('Failed to fetch blog metadata:', error);
        return { title: 'Blog' };
    }
}

export default async function BlogPostPage({ params }: PageProps<'/blogs/[slug]'>) {
    const { slug } = await params;

    try {
        const { success, data } = await httpRequest<SingleBlogRes>(`/api/blogs/${slug}`, {
            method: 'GET',
            cache: 'no-store',
        });

        if (!success || !data) {
            notFound();
        }

        return (
            <article className="mx-auto max-w-4xl px-4 py-12">
                <BlogContent blog={data.blog} categories={data.categories} tags={data.tags} />
                <CommentSection blogId={data.blog.id} comments={data.comments} />
            </article>
        );
    } catch (error) {
        console.error('Failed to fetch blog post:', error);
        notFound();
    }
}
