import { desc, eq } from 'drizzle-orm';
import type { MetadataRoute, Route } from 'next';
import { siteConfig } from '@/configs/site';
import { db } from '@/lib/drizzle';
import { blogs } from '@/lib/drizzle/schema';
import { buildCanonicalUrl, buildCloudinaryUrl } from '@/lib/utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: buildCanonicalUrl('/'),
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
            images: [siteConfig.logoSvg],
        },
        {
            url: buildCanonicalUrl('/blogs'),
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
            images: [siteConfig.logoSvg],
        },
        {
            url: buildCanonicalUrl('/projects'),
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
            images: [siteConfig.logoSvg],
        },
        {
            url: buildCanonicalUrl('/about'),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
            images: [siteConfig.logoSvg],
        },
        {
            url: buildCanonicalUrl('/contact'),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
            images: [siteConfig.logoSvg],
        },
        {
            url: buildCanonicalUrl('/resume'),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
            images: [siteConfig.logoSvg],
        },
    ];

    // Dynamic blog posts (published only)
    const rows = await db
        .select({
            slug: blogs.slug,
            updatedAt: blogs.updated_at,
            image: blogs.cover_image,
        })
        .from(blogs)
        .where(eq(blogs.is_published, true))
        .orderBy(desc(blogs.updated_at));

    const blogRoutes: MetadataRoute.Sitemap = rows.map((blog) => ({
        url: buildCanonicalUrl(`/blogs/${blog.slug}` as Route),
        lastModified: new Date(blog.updatedAt),
        changeFrequency: 'daily',
        priority: 0.7,
        images: blog.image ? [buildCloudinaryUrl(blog.image)] : undefined,
    }));

    return [...staticRoutes, ...blogRoutes];
}
