import type { Metadata } from 'next';
import ConvMessage from '@/app/messages/_components/ConvMessage';
import type { SearchParams } from '@/types';

export const metadata: Metadata = {
    title: 'Messages',
    description: 'View and manage your messages.',
};

export default async function MessagePage({ searchParams }: SearchParams<'chat'>) {
    const { chat } = await searchParams;

    return <ConvMessage chatId={chat} />;
}
