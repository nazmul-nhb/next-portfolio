import type { Metadata, Route } from 'next';
import { notFound } from 'next/navigation';
import { getTimestamp, truncateString } from 'nhb-toolbox';
import { siteConfig } from '@/configs/site';
import { httpRequest } from '@/lib/actions/baseRequest';
import {
    buildCanonicalUrl,
    buildCloudinaryUrl,
    buildOpenGraphImages,
    stripHtml,
} from '@/lib/utils';
import type { SingleBlogRes } from '@/types/blogs';
import SingleBlogPage from './_components/SingleBlogPage';

export async function generateMetadata({
    params,
}: PageProps<'/blogs/[slug]'>): Promise<Metadata> {
    const { slug } = await params;

    try {
        const { data } = await httpRequest<SingleBlogRes>(`/api/blogs/${slug}`);

        if (!data?.blog) return { title: 'Blog Not Found' };

        const { author, content, cover_image, excerpt, title } = data?.blog || {};

        const description = excerpt || truncateString(stripHtml(content), 160);

        return {
            title: `${title} by ${author.name}`,
            description,
            keywords: [
                ...data.tags.map((tag) => tag.title),
                ...siteConfig.keywords,
                ...data.blog.title.split(' '),
            ],
            alternates: { canonical: buildCanonicalUrl(`/blogs/${slug}` as Route) },
            icons: {
                icon: siteConfig.favicon,
                shortcut: siteConfig.favicon,
            },
            authors: [
                { name: siteConfig.name, url: siteConfig.baseUrl },
                { name: author.name, url: `${siteConfig.baseUrl}/users/${author.id}` },
            ],
            openGraph: {
                title: `${title} by ${author.name}`,
                description,
                images: buildOpenGraphImages(
                    cover_image && buildCloudinaryUrl(cover_image),
                    siteConfig.logoSvg,
                    siteConfig.favicon
                ),
                type: 'article',
                publishedTime: data.blog.published_date
                    ? getTimestamp(data.blog.published_date)
                    : undefined,
                modifiedTime: data.blog.updated_at
                    ? getTimestamp(data.blog.updated_at)
                    : undefined,
                authors: author.name,
                tags: data.tags.map((tag) => tag.slug),
                locale: 'en_US',
            },
        };
    } catch (error) {
        console.error('Failed to fetch blog metadata:', error);
        return { title: 'Blog' };
    }
}

export default async function BlogPostPage({ params }: PageProps<'/blogs/[slug]'>) {
    try {
        const { slug } = await params;

        if (!slug) {
            notFound();
        }

        return <SingleBlogPage slug={slug} />;
    } catch (error) {
        console.error('Failed to fetch blog post:', error);
        notFound();
    }
}
