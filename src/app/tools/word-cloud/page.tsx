import type { Metadata } from 'next';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import WordCloudGenerator from './_components/WordCloudGenerator';

const description =
    'Paste text and create a visual word cloud with customizable fonts, colors, and layout. Export as PNG or JPEG.';

export const metadata: Metadata = {
    title: 'Word Cloud Generator',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'word cloud',
        'word cloud generator',
        'text visualization',
        'word frequency',
        'text analysis',
        'word art',
        'visualization tool',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/word-cloud') },
    openGraph: {
        title: `Word Cloud Generator from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/word-cloud'),
        siteName: siteConfig.name,
    },
};

export default function WordCloudPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Word Cloud Generator
                </h1>
                <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{description}</p>
            </div>
            <WordCloudGenerator />
        </div>
    );
}
