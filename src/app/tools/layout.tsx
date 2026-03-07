import type { Metadata } from 'next';
import { ToolsSidebar } from '@/components/nav/tools-sidebar';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl, buildOpenGraphImages } from '@/lib/utils';
import type { ChildrenProp } from '@/types';

const description = 'Utilities for daily productivity and personal management.';

export const metadata: Metadata = {
    title: {
        default: 'Tools',
        template: `%s » Tools » ${siteConfig.name}`,
    },
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'tools',
        'utilities',
        'productivity tools',
        'personal management tools',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools') },
    openGraph: {
        title: `Tools from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools'),
        siteName: siteConfig.name,
        images: buildOpenGraphImages(siteConfig.favicon, siteConfig.logoSvg),
    },
    twitter: {
        card: 'summary_large_image',
        title: `Tools from ${siteConfig.name}`,
        description,
        images: buildOpenGraphImages(siteConfig.favicon, siteConfig.logoSvg),
        creator: '@nhb42',
    },
};

export default function ToolsLayout({ children }: ChildrenProp) {
    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            <ToolsSidebar />
            <main className="flex-1 overflow-x-hidden">
                <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
            </main>
        </div>
    );
}
