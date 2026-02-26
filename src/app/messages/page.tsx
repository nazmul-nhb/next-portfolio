'use client';

import { User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useDebouncedValue } from 'nhb-hooks';
import { formatDate } from 'nhb-toolbox';
import { useEffect, useState } from 'react';
import ChatArea from '@/app/messages/_components/ChatArea';
import Loading from '@/components/loading';
import { FadeInUp } from '@/components/misc/animations';
import { Input } from '@/components/ui/input';
import { useApiQuery } from '@/lib/hooks/use-api';
import { buildCloudinaryUrl } from '@/lib/utils';
import type { Conversation, UserResult } from '@/types/messages';

/** Messages page with conversation list and chat view. */
export default function MessagesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [activeConversation, setActiveConversation] = useState<number | null>(null);
    const [recipientSearch, setRecipientSearch] = useState('');
    const [debouncedSearch, cancelSearch] = useDebouncedValue(recipientSearch);
    const [selectedRecipient, setSelectedRecipient] = useState<UserResult | null>(null);

    const { data: conversations = [] } = useApiQuery<Conversation[]>(
        '/api/messages/conversations',
        {
            enabled: status === 'authenticated',
            refetchInterval: 10000,
            queryKey: ['conversations'],
        }
    );

    const { data: searchResults = [], isFetching: searching } = useApiQuery<UserResult[]>(
        `/api/users/search?q=${encodeURIComponent(debouncedSearch)}`,
        {
            enabled: debouncedSearch.length >= 2,
            staleTime: 10000,
            queryKey: ['user-search', debouncedSearch],
        }
    );

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    // Debounced user search
    const handleRecipientSearch = (value: string) => {
        setRecipientSearch(value);
        setSelectedRecipient(null);
    };

    const selectRecipient = (user: UserResult) => {
        setSelectedRecipient(user);
        setRecipientSearch(user.email);
    };

    if (status === 'loading') return <Loading />;

    if (!session?.user) return null;

    return (
        <div className="mx-auto max-w-5xl px-4 py-12">
            <FadeInUp>
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold tracking-tight">Messages</h1>
                    <p className="text-muted-foreground">
                        Your private conversations with other users.
                    </p>
                </div>
            </FadeInUp>

            <FadeInUp delay={0.1}>
                <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                    {/* Conversation list */}
                    <div className="space-y-2 rounded-xl border border-border/50 bg-card p-4">
                        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                            Conversations
                        </h2>

                        {/* New conversation */}
                        <div className="border-y border-border/50 py-3">
                            <p className="mb-2 text-xs text-muted-foreground">
                                Start new conversation
                            </p>
                            <div className="relative">
                                <Input
                                    className="h-8 text-xs"
                                    onChange={(e) => handleRecipientSearch(e.target.value)}
                                    placeholder="Search by name or email..."
                                    value={recipientSearch}
                                />
                                {/* Search results dropdown */}
                                {searchResults.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
                                        {searchResults.map((user) => (
                                            <button
                                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-accent"
                                                key={user.id}
                                                onClick={() => selectRecipient(user)}
                                                type="button"
                                            >
                                                {user.profile_image ? (
                                                    <Image
                                                        alt={user.name}
                                                        className="h-6 w-6 rounded-full object-cover"
                                                        height={24}
                                                        src={buildCloudinaryUrl(
                                                            user.profile_image
                                                        )}
                                                        width={24}
                                                    />
                                                ) : (
                                                    <User className="h-6 w-6 rounded-full bg-muted p-1" />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium">
                                                        {user.name}
                                                    </p>
                                                    <p className="truncate text-muted-foreground">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {searching && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Searching...
                                    </p>
                                )}
                                {selectedRecipient && (
                                    <p className="mt-1 text-xs text-primary">
                                        Ready to message {selectedRecipient.name}
                                    </p>
                                )}
                            </div>
                        </div>
                        {conversations.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No conversations yet.
                            </p>
                        ) : (
                            conversations.map((conv) => (
                                <button
                                    className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                                        activeConversation === conv.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-muted'
                                    }`}
                                    key={conv.id}
                                    onClick={() => {
                                        setActiveConversation(conv.id);
                                        cancelSearch();
                                    }}
                                    type="button"
                                >
                                    {conv.otherUser.profile_image ? (
                                        <Image
                                            alt={conv.otherUser.name}
                                            className="h-9 w-9 rounded-full object-cover"
                                            height={36}
                                            src={buildCloudinaryUrl(
                                                conv.otherUser.profile_image
                                            )}
                                            width={36}
                                        />
                                    ) : (
                                        <User className="h-9 w-9 rounded-full bg-muted p-1.5" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {conv.otherUser.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate({
                                                date: conv.last_message_at,
                                                format: 'dd, mmm DD, YYYY hh:mm:ss a',
                                            })}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Chat area */}
                    <ChatArea
                        activeConversation={activeConversation}
                        selectedRecipient={selectedRecipient}
                        setActiveConversation={setActiveConversation}
                        setRecipientSearch={setRecipientSearch}
                        setSelectedRecipient={setSelectedRecipient}
                    />
                </div>
            </FadeInUp>
        </div>
    );
}
