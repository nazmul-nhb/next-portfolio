import { eq } from 'drizzle-orm';
import type { Route } from 'next';
import { ImageResponse } from 'next/og';
import { formatWithPlural } from 'nhb-toolbox';
import { siteConfig } from '@/configs/site';
import { db } from '@/lib/drizzle';
import { polls } from '@/lib/drizzle/schema/polls';
import { buildCanonicalUrl } from '@/lib/utils';
import { OgImageLayout } from '../../../_og/OgImageLayout';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let question = 'Crowd Poll';
    let totalVotes = 0;

    try {
        const [poll] = await db
            .select({ question: polls.question, total_votes: polls.total_votes })
            .from(polls)
            .where(eq(polls.id, +id))
            .limit(1);

        if (poll) {
            question = poll.question;
            totalVotes = poll.total_votes;
        }
    } catch {
        // Use defaults
    }

    return new ImageResponse(
        <OgImageLayout
            description={`${question} — ${formatWithPlural(totalVotes, 'vote')} so far. Vote now and see real-time results!`}
            siteTitle={`Crowd Polls » ${siteConfig.name}`}
            tag="Crowd Poll"
            title={`Poll: ${question}`}
            url={buildCanonicalUrl(`/tools/crowd-polls/${id}` as Route)}
        />
    );
}
