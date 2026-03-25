import { eq } from 'drizzle-orm';
import type { Metadata, Route } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/configs/site';
import { db } from '@/lib/drizzle';
import { polls } from '@/lib/drizzle/schema/polls';
import { buildCanonicalUrl } from '@/lib/utils';
import { PollDetailClient } from './_components/PollDetailClient';

type PollPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PollPageProps): Promise<Metadata> {
    const { id } = await params;

    try {
        const [poll] = await db
            .select({ question: polls.question, total_votes: polls.total_votes })
            .from(polls)
            .where(eq(polls.id, +id))
            .limit(1);

        if (!poll) return { title: 'Poll Not Found' };

        const description = `${poll.question} — ${poll.total_votes} votes so far. Vote now on this crowd poll!`;

        return {
            title: poll.question,
            description,
            alternates: { canonical: buildCanonicalUrl(`/tools/crowd-polls/${id}` as Route) },
            openGraph: {
                title: `${poll.question} — Crowd Poll`,
                description,
                url: buildCanonicalUrl(`/tools/crowd-polls/${id}` as Route),
                siteName: siteConfig.name,
            },
        };
    } catch {
        return { title: 'Crowd Poll' };
    }
}

export default async function PollDetailPage({ params }: PollPageProps) {
    const { id } = await params;
    const pollId = Number(id);

    if (!pollId || Number.isNaN(pollId)) notFound();

    return <PollDetailClient pollId={pollId} />;
}
