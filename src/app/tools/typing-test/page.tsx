import type { Metadata } from 'next';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
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
            <TitleWithShare
                description={description}
                route="/tools/typing-test"
                title="Typing Speed Test"
            />
            <TypingSpeedTest />
        </div>
    );
}
