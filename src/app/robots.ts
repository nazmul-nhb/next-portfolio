import type { MetadataRoute, Route } from 'next';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin', '/api', '/auth', '/messages'],
            },
        ],
        sitemap: buildCanonicalUrl('/sitemap.xml' as Route),
        host: siteConfig.baseUrl,
    };
}
