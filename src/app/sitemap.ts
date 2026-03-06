import { desc, eq } from 'drizzle-orm';
import type { MetadataRoute, Route } from 'next';
import { siteConfig } from '@/configs/site';
import { db } from '@/lib/drizzle';
import { blogs, projects } from '@/lib/drizzle/schema';
import { buildCanonicalUrl, buildCloudinaryUrl } from '@/lib/utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const logo = buildCanonicalUrl(siteConfig.logoSvg as Route);

    // Static pages
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: buildCanonicalUrl('/'),
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
            images: [logo],
        },
        {
            url: buildCanonicalUrl('/blogs'),
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
            images: [logo],
        },
        {
            url: buildCanonicalUrl('/projects'),
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
            images: [logo],
        },
        {
            url: buildCanonicalUrl('/about'),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
            images: [logo],
        },
        {
            url: buildCanonicalUrl('/contact'),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
            images: [logo],
        },
        {
            url: buildCanonicalUrl('/resume'),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
            images: [logo],
        },
        {
            url: buildCanonicalUrl('/tools'),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
            images: [logo],
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

    // Dynamic project pages
    const projectRows = await db
        .select({
            id: projects.id,
            updatedAt: projects.updated_at,
            screenshots: projects.screenshots,
        })
        .from(projects)
        .orderBy(desc(projects.updated_at));

    const projectRoutes: MetadataRoute.Sitemap = projectRows.map((project) => ({
        url: buildCanonicalUrl(`/projects/${project.id}` as Route),
        lastModified: new Date(project.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
        images: project.screenshots.length
            ? [buildCloudinaryUrl(project.screenshots[0])]
            : undefined,
    }));

    return [...staticRoutes, ...blogRoutes, ...projectRoutes];
}
