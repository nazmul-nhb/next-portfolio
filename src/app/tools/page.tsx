import type { Metadata } from 'next';
import Link from 'next/link';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import SmartAlert from '@/components/misc/smart-alert';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import Navigate from './_components/Navigate';

const description = 'Utilities for daily productivity, personal management and fun.';

export const metadata: Metadata = {
    title: 'Tools',
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
    },
};

export default function ToolsPage() {
    return (
        <div className="space-y-6">
            <TitleWithShare
                description={description}
                route="/tools"
                shareLabel="Share this page"
                title={`All Tools (${siteConfig.toolsMenus.length})`}
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {siteConfig.toolsMenus.map(({ description, href, icon: Icon, label }) => (
                    <Link
                        className="transition-transform duration-300 hover:scale-102"
                        href={href}
                        key={label}
                    >
                        <Card className="transition-shadow hover:shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Icon className="size-5" />
                                    {label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="line-clamp-2">
                                    {description}
                                </CardDescription>
                            </CardContent>
                            <CardFooter className="border-t flex-1">
                                <Navigate href={href} />
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>

            <SmartAlert description="More tools will appear here as they are added." />
        </div>
    );
}
