import type { Metadata } from 'next';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import { PollsClient } from './_components/PollsClient';

const description =
    'Create and participate in crowd polls. Vote on active polls with anonymous voting support, and watch results update in real-time.';

export const metadata: Metadata = {
    title: 'Crowd Polls',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'poll',
        'vote',
        'survey',
        'opinion',
        'crowd poll',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/crowd-polls') },
    openGraph: {
        title: `Crowd Polls from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/crowd-polls'),
        siteName: siteConfig.name,
    },
};

export default function CrowdPollsPage() {
    return <PollsClient />;
}
