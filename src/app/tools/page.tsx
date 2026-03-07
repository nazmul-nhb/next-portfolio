import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl, buildOpenGraphImages } from '@/lib/utils';

const description = 'Utilities for daily productivity and personal management.';

export const metadata: Metadata = {
    title: 'All Tools',
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

export default function ToolsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">All Tools</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Utilities available for your account.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {siteConfig.toolsMenus.map(({ description, href, icon: Icon, label }) => (
                    <Card className="transition-shadow hover:shadow-md" key={label}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Icon className="size-5" />
                                {label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{description}</CardDescription>
                        </CardContent>
                        <CardFooter className="border-t flex-1">
                            <Link
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary border-b border-b-transparent hover:border-b-primary hover:text-primary"
                                href={href}
                            >
                                Open Tool
                                <ArrowRight className="size-4" />
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {siteConfig.toolsMenus.length < 3 && (
                <p className="text-xs text-muted-foreground">
                    More tools will appear here as they are added.
                </p>
            )}
        </div>
    );
}
