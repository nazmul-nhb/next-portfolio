import type { Metadata } from 'next';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import WordCounter from './_components/WordCounter';

const description =
    'Analyze your text with detailed word, character, and readability metrics. Perfect for writers, students, and content creators.';

export const metadata: Metadata = {
    title: 'Word Counter',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'word counter',
        'character count',
        'word count tool',
        'text analyzer',
        'reading time calculator',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/word-counter') },
    openGraph: {
        title: `Word Counter from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/word-counter'),
        siteName: siteConfig.name,
    },
};

export default function WordCounterPage() {
    return <WordCounter />;
}
