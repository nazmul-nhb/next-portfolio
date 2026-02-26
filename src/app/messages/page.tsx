import ConvMessage from '@/app/messages/_components/ConvMessage';
import type { Uncertain } from '@/types';

type SearchParams = {
    searchParams: Promise<{
        chat: Uncertain<string>;
    }>;
};

export default async function MessagePage({ searchParams }: SearchParams) {
    const { chat } = await searchParams;

    return <ConvMessage chatId={chat} />;
}
