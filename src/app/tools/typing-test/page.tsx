import type { Metadata } from 'next';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import TypingSpeedTest from './_components/TypingSpeedTest';

const description =
    'Test your typing speed and accuracy with real-time metrics, WPM tracking, and multiple duration modes.';

export const metadata: Metadata = {
    title: 'Typing Speed Test',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'typing test',
        'typing speed',
        'wpm',
        'words per minute',
        'typing accuracy',
        'typing game',
        'typing practice',
        'typing trainer',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/typing-test') },
    openGraph: {
        title: `Typing Speed Test from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/typing-test'),
        siteName: siteConfig.name,
    },
};

export default function TypingTestPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Typing Speed Test
                </h1>
                <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{description}</p>
            </div>
            <TypingSpeedTest />
        </div>
    );
}
