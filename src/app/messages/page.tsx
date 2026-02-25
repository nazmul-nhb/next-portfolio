'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatDate } from 'nhb-toolbox';
import { useEffect, useRef, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import Loading from '@/components/loading';
import { FadeInUp } from '@/components/misc/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { httpRequest } from '@/lib/actions/baseRequest';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { buildCloudinaryUrl } from '@/lib/utils';

interface Conversation {
    id: number;
    participant_one: number;
    participant_two: number;
    last_message_at: string;
    created_at: string;
    otherUser: {
        id: number;
        name: string;
        profile_image: string | null;
    };
}

interface Message {
    id: number;
    content: string;
    sender_id: number;
    is_read: boolean;
    created_at: string;
}

interface UserResult {
    id: number;
    name: string;
    email: string;
    profile_image: string | null;
}

/** Messages page with conversation list and chat view. */
export default function MessagesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [activeConversation, setActiveConversation] = useState<number | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [recipientSearch, setRecipientSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState<UserResult | null>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { data: conversations = [] } = useApiQuery<Conversation[]>(
        '/api/messages/conversations',
        {
            enabled: status === 'authenticated',
            refetchInterval: 10000,
            queryKey: ['conversations'],
        }
    );

    const { data: messages = [] } = useApiQuery<Message[]>(
        `/api/messages/conversations/${activeConversation}`,
        {
            enabled: !!activeConversation,
            refetchInterval: 10000,
            queryKey: ['messages', activeConversation],
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

    const { mutate: sendMsg, isPending: sending } = useApiMutation<null, { content: string }>(
        `/api/messages/conversations/${activeConversation ?? 0}`,
        'POST',
        {
            invalidateKeys: ['messages', 'conversations'],
            onSuccess: () => setNewMessage(''),
            onError: (error) => console.error('Failed to send message:', error),
        }
    );

    /** Combined create-conversation + send-first-message mutation */
    const { mutate: createAndSend, isPending: creatingConversation } = useMutation({
        mutationFn: async ({ email, message }: { email: string; message: string }) => {
            const { data: conv } = await httpRequest<Conversation, { email: string }>(
                '/api/messages/conversations',
                { method: 'POST', body: { email } }
            );

            if (!conv) throw new Error('Failed to create conversation');

            await httpRequest<null, { content: string }>(
                `/api/messages/conversations/${conv.id}`,
                { method: 'POST', body: { content: message } }
            );
            return conv;
        },
        onSuccess: (conv) => {
            setActiveConversation(conv.id);
            setSelectedRecipient(null);
            setRecipientSearch('');
            setDebouncedSearch('');
            setNewMessage('');
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['messages', conv.id] });
        },
        onError: (error) => console.error('Failed to create conversation:', error),
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    // Debounced user search
    const handleRecipientSearch = (value: string) => {
        setRecipientSearch(value);
        setSelectedRecipient(null);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (value.trim().length < 2) {
            setDebouncedSearch('');
            return;
        }

        searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(value.trim()), 300);
    };

    const selectRecipient = (user: UserResult) => {
        setSelectedRecipient(user);
        setRecipientSearch(user.email);
        setDebouncedSearch('');
    };

    const handleSend = () => {
        if (!newMessage.trim()) return;
        if (activeConversation) {
            sendMsg({ content: newMessage });
        } else if (selectedRecipient) {
            createAndSend({ email: selectedRecipient.email, message: newMessage });
        }
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
                                    onClick={() => setActiveConversation(conv.id)}
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
                    <div className="flex flex-col rounded-xl border border-border/50 bg-card">
                        {activeConversation ? (
                            <Fragment>
                                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                                    {messages.map((msg) => (
                                        <div
                                            className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${
                                                msg.sender_id === +session.user.id
                                                    ? 'ml-auto bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                            }`}
                                            key={msg.id}
                                        >
                                            <p>{msg.content}</p>
                                            <p className="mt-1 text-xs opacity-60">
                                                {formatDate({
                                                    date: msg.created_at,
                                                    format: 'dd, mmm DD, YYYY hh:mm:ss a',
                                                })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 border-t border-border/50 p-4">
                                    <Input
                                        disabled={sending || creatingConversation}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' && !e.shiftKey && handleSend()
                                        }
                                        placeholder="Type a message..."
                                        value={newMessage}
                                    />
                                    <Button
                                        disabled={
                                            !newMessage.trim() ||
                                            sending ||
                                            creatingConversation
                                        }
                                        onClick={handleSend}
                                        size="icon"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Fragment>
                        ) : selectedRecipient ? (
                            <Fragment>
                                <div className="flex flex-1 flex-col items-center justify-center py-20">
                                    {selectedRecipient.profile_image ? (
                                        <Image
                                            alt={selectedRecipient.name}
                                            className="mb-3 h-16 w-16 rounded-full object-cover"
                                            height={64}
                                            src={buildCloudinaryUrl(
                                                selectedRecipient.profile_image
                                            )}
                                            width={64}
                                        />
                                    ) : (
                                        <User className="mb-3 h-16 w-16 rounded-full bg-muted p-3 text-muted-foreground" />
                                    )}
                                    <p className="text-sm font-medium">
                                        {selectedRecipient.name}
                                    </p>
                                    <p className="mb-2 text-xs text-muted-foreground">
                                        {selectedRecipient.email}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Send a message to start the conversation
                                    </p>
                                </div>
                                <div className="flex gap-2 border-t border-border/50 p-4">
                                    <Input
                                        disabled={sending || creatingConversation}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' && !e.shiftKey && handleSend()
                                        }
                                        placeholder="Type a message..."
                                        value={newMessage}
                                    />
                                    <Button
                                        disabled={
                                            !newMessage.trim() ||
                                            sending ||
                                            creatingConversation
                                        }
                                        onClick={handleSend}
                                        size="icon"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Fragment>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center py-20">
                                <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">
                                    Select a conversation to start chatting.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </FadeInUp>
        </div>
    );
}
