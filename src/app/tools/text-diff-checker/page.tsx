import type { Metadata } from 'next';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import TextDiffChecker from './_components/TextDiffChecker';

const description =
    'Compare two texts side-by-side and view detailed differences with line-by-line highlighting. Perfect for tracking changes, reviewing edits, and understanding text modifications.';

export const metadata: Metadata = {
    title: 'Text Diff Checker',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'text diff',
        'diff checker',
        'compare text',
        'text comparison',
        'diff tool',
        'text changes',
        'line diff',
        'change tracking',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/text-diff-checker') },
    openGraph: {
        title: `Text Diff Checker from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/text-diff-checker'),
        siteName: siteConfig.name,
    },
};

export default function TextDiffCheckerPage() {
    return <TextDiffChecker />;
}
