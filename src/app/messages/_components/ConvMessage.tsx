'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useBreakPoint } from 'nhb-hooks';
import { useCallback, useEffect, useState } from 'react';
import ChatArea from '@/app/messages/_components/ChatArea';
import ConversationList from '@/app/messages/_components/ConversationList';
import Loading from '@/components/loading';
import { useApiQuery } from '@/lib/hooks/use-api';
import { cn } from '@/lib/utils';
import type { Uncertain } from '@/types';
import type { Conversation, UserResult } from '@/types/messages';

type Props = {
    chatId: Uncertain<string>;
};

/** Messages page — Telegram-style split layout with URL-driven conversation selection. */
export default function ConvMessage({ chatId }: Props) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { mobile } = useBreakPoint();

    const activeConversationId = chatId ? +chatId : null;

    const [selectedRecipient, setSelectedRecipient] = useState<UserResult | null>(null);

    const { data: conversations = [] } = useApiQuery<Conversation[]>(
        '/api/messages/conversations',
        {
            enabled: status === 'authenticated',
            refetchInterval: 10000,
            queryKey: ['conversations'],
        }
    );

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirectTo=/messages');
        }
    }, [status, router]);

    /** Navigate to a conversation via URL. */
    const setActiveConversation = useCallback(
        (id: number | null) => {
            setSelectedRecipient(null);
            if (id) {
                router.push(`/messages?chat=${id}`, { scroll: false });
            } else {
                router.push('/messages', { scroll: false });
            }
        },
        [router]
    );

    /** When a user is selected from search that has an existing conversation. */
    const handleSelectConversation = useCallback(
        (id: number) => {
            setSelectedRecipient(null);
            setActiveConversation(id);
        },
        [setActiveConversation]
    );

    /** When a new recipient (no existing conversation) is selected from search. */
    const handleSelectNewRecipient = useCallback(
        (user: UserResult) => {
            // Clear URL param since there's no conversation yet
            router.push('/messages', { scroll: false });
            setSelectedRecipient(user);
        },
        [router]
    );

    /** Back button handler — go back to conversation list (mobile). */
    const handleBack = useCallback(() => {
        setSelectedRecipient(null);
        router.push('/messages', { scroll: false });
    }, [router]);

    /** After a new conversation is created (first message sent). */
    const handleConversationCreated = useCallback(
        (convId: number) => {
            setSelectedRecipient(null);
            setActiveConversation(convId);
        },
        [setActiveConversation]
    );

    if (status === 'loading') return <Loading />;
    if (!session?.user) return null;

    const isChatOpen = !!activeConversationId || !!selectedRecipient;

    return (
        <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl overflow-hidden border-x border-border/30">
            {/* Left panel — Conversation list */}
            <div
                className={cn(
                    'h-full shrink-0 border-r border-border/30',
                    // Mobile: full width when no chat, hidden when chat is open
                    // Desktop: fixed width, always visible
                    mobile ? (isChatOpen ? 'hidden' : 'w-full') : 'w-80'
                )}
            >
                <ConversationList
                    activeConversationId={activeConversationId}
                    conversations={conversations}
                    onSelectConversation={handleSelectConversation}
                    onSelectNewRecipient={handleSelectNewRecipient}
                />
            </div>

            {/* Right panel — Chat area */}
            <div
                className={cn(
                    'h-full min-w-0 flex-1',
                    // Mobile: full width when chat is open, hidden otherwise
                    mobile ? (isChatOpen ? 'block' : 'hidden') : 'block'
                )}
            >
                <ChatArea
                    activeConversationId={activeConversationId}
                    conversations={conversations}
                    onBack={handleBack}
                    onConversationCreated={handleConversationCreated}
                    selectedRecipient={selectedRecipient}
                />
            </div>
        </div>
    );
}
