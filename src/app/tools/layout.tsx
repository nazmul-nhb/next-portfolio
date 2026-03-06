import { AlertTriangleIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ToolsSidebar } from '@/components/nav/tools-sidebar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { siteConfig } from '@/configs/site';
import { buildOpenGraphImages } from '@/lib/utils';
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
    openGraph: {
        title: `Tools from ${siteConfig.name}`,
        description,
        url: `${siteConfig.baseUrl}/resume`,
        siteName: siteConfig.name,
        images: buildOpenGraphImages(siteConfig.logoSvg, siteConfig.favicon),
    },
    twitter: {
        card: 'summary_large_image',
        title: `Tools from ${siteConfig.name}`,
        description,
        images: buildOpenGraphImages(siteConfig.logoSvg, siteConfig.favicon),
        creator: '@nhb42',
    },
};

export default function ToolsLayout({ children }: ChildrenProp) {
    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            <ToolsSidebar />
            <main className="flex-1 overflow-x-hidden">
                <div className="mx-auto max-w-7xl p-4 md:p-8">
                    <Alert className="mb-8 border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900 dark:text-yellow-50 select-none">
                        <AlertTriangleIcon />
                        <AlertTitle>Experimental Feature (Under Development)</AlertTitle>
                        <AlertDescription className="inline">
                            This feature is experimental and still under active development. You
                            may encounter bugs or incomplete functionality.
                            <br />
                            If you notice any issues or have suggestions, please{' '}
                            <Link
                                className="border-b border-b-yellow-800 hover:text-primary dark:border-b-yellow-50 hover:dark:border-b-primary hover:dark:text-primary"
                                href="/contact#send-message"
                            >
                                send your feedback
                            </Link>
                            .
                        </AlertDescription>
                    </Alert>
                    {children}
                </div>
            </main>
        </div>
    );
}
