import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { truncateString } from 'nhb-toolbox';
import { siteConfig } from '@/configs/site';
import { db } from '@/lib/drizzle';
import { blogs } from '@/lib/drizzle/schema/blogs';
import { buildCloudinaryUrl, buildOpenGraphImages } from '@/lib/utils';
import SingleBlogPage from './_components/SingleBlogPage';

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
            icons: {
                icon: siteConfig.favicon,
                shortcut: siteConfig.favicon,
            },
            authors: [{ name: siteConfig.name, url: siteConfig.baseUrl }],
            openGraph: {
                title: blog.title,
                description: blog.excerpt || truncateString(blog.content, 160),
                images: buildOpenGraphImages(
                    blog.cover_image && buildCloudinaryUrl(blog.cover_image),
                    siteConfig.logoSvg,
                    siteConfig.favicon
                ),
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
