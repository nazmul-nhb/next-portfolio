import type { Metadata } from 'next';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import WordCloudGenerator from './_components/WordCloudGenerator';

const description =
    'Generate word clouds from text with customizable fonts, colors, and layouts. Export as PNG or JPEG with spiral or random word layout.';

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
            <TitleWithShare
                description={description}
                route="/tools/word-cloud"
                title="Word Cloud Generator"
            />
            <WordCloudGenerator />
        </div>
    );
}
