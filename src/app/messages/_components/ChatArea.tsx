'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MessageSquare, Send, User } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from 'nhb-toolbox';
import { useEffect, useRef, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { httpRequest } from '@/lib/actions/baseRequest';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { useUserStore } from '@/lib/store/user-store';
import { buildCloudinaryUrl, cn } from '@/lib/utils';
import type { Conversation, Message, UserResult } from '@/types/messages';

type Props = {
    activeConversationId: number | null;
    conversations: Conversation[];
    selectedRecipient: UserResult | null;
    onBack: () => void;
    onConversationCreated: (convId: number) => void;
};

export default function ChatArea({
    activeConversationId,
    conversations,
    selectedRecipient,
    onBack,
    onConversationCreated,
}: Props) {
    const [newMessage, setNewMessage] = useState('');
    const { profile } = useUserStore();
    const queryClient = useQueryClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Find the other user from the active conversation
    const activeConv = conversations.find((c) => c.id === activeConversationId);
    const chatPartner = activeConv?.otherUser ?? selectedRecipient;

    const { data: messages = [] } = useApiQuery<Message[]>(
        `/api/messages/conversations/${activeConversationId}`,
        {
            enabled: !!activeConversationId,
            refetchInterval: 10000,
            queryKey: ['messages', activeConversationId],
        }
    );

    const { mutate: sendMsg, isPending: sending } = useApiMutation<null, { content: string }>(
        `/api/messages/conversations/${activeConversationId ?? 0}`,
        'POST',
        {
            invalidateKeys: ['messages', 'conversations'],
            onSuccess: () => setNewMessage(''),
            onError: (error) => console.error('Failed to send message:', error),
            silentSuccessMessage: true,
        }
    );

    /** Combined create-conversation + send-first-message mutation. */
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
            onConversationCreated(conv.id);
            setNewMessage('');
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['messages', conv.id] });
        },
        onError: (error) => console.error('Failed to create conversation:', error),
    });

    const handleSend = () => {
        if (!newMessage.trim()) return;
        if (activeConversationId) {
            sendMsg({ content: newMessage });
        } else if (selectedRecipient) {
            createAndSend({ email: selectedRecipient.email, message: newMessage });
        }
    };

    // Auto-scroll to bottom on new messages
    // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Group messages by date
    const groupedMessages = groupMessagesByDate(messages);

    // No conversation or recipient selected
    if (!activeConversationId && !selectedRecipient) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-card/50">
                <MessageSquare className="mb-4 h-16 w-16 text-muted-foreground/30" />
                <h2 className="text-lg font-medium text-muted-foreground">
                    Select a conversation
                </h2>
                <p className="mt-1 text-sm text-muted-foreground/70">
                    Choose from your existing conversations or search for a user to start a new
                    one.
                </p>
            </div>
        );
    }

    const isBusy = sending || creatingConversation;

    return (
        <div className="flex h-full flex-col bg-card/50">
            {/* Chat header / title bar */}
            <div className="flex shrink-0 items-center gap-3 border-b border-border/50 px-3 py-2.5">
                <button
                    className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-muted md:hidden"
                    onClick={onBack}
                    type="button"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                {chatPartner && (
                    <Fragment>
                        {chatPartner.profile_image ? (
                            <Image
                                alt={chatPartner.name}
                                className="h-9 w-9 shrink-0 rounded-full object-cover"
                                height={36}
                                src={buildCloudinaryUrl(chatPartner.profile_image)}
                                width={36}
                            />
                        ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <User className="h-5 w-5" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{chatPartner.name}</p>
                            {
                                <p className="truncate text-xs text-muted-foreground">
                                    {chatPartner.email}
                                </p>
                            }
                        </div>
                    </Fragment>
                )}
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-3" ref={messagesContainerRef}>
                {activeConversationId && messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            No messages yet. Say hello!
                        </p>
                    </div>
                ) : !activeConversationId && selectedRecipient ? (
                    <div className="flex h-full flex-col items-center justify-center">
                        {selectedRecipient.profile_image ? (
                            <Image
                                alt={selectedRecipient.name}
                                className="mb-3 h-20 w-20 rounded-full object-cover"
                                height={80}
                                src={buildCloudinaryUrl(selectedRecipient.profile_image)}
                                width={80}
                            />
                        ) : (
                            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <User className="h-10 w-10" />
                            </div>
                        )}
                        <p className="text-base font-semibold">{selectedRecipient.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {selectedRecipient.email}
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Send a message to start the conversation.
                        </p>
                    </div>
                ) : (
                    groupedMessages.map(({ date, msgs }) => (
                        <div key={date}>
                            {/* Date separator */}
                            <div className="my-4 flex items-center justify-center">
                                <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
                                    {date}
                                </span>
                            </div>
                            {/* Messages in this date group */}
                            <div className="space-y-1">
                                {msgs.map((msg, idx) => {
                                    const isOwn = msg.sender_id === profile?.id;
                                    const prevMsg = idx > 0 ? msgs[idx - 1] : null;
                                    const nextMsg =
                                        idx < msgs.length - 1 ? msgs[idx + 1] : null;
                                    const isSameSenderAsPrev =
                                        prevMsg?.sender_id === msg.sender_id;
                                    const isSameSenderAsNext =
                                        nextMsg?.sender_id === msg.sender_id;

                                    // Determine bubble shape for grouping
                                    const isFirst = !isSameSenderAsPrev;
                                    const isLast = !isSameSenderAsNext;

                                    return (
                                        <div
                                            className={cn(
                                                'flex',
                                                isOwn ? 'justify-end' : 'justify-start',
                                                !isFirst && 'mt-0.5'
                                            )}
                                            key={msg.id}
                                        >
                                            <div
                                                className={cn(
                                                    'max-w-[75%] px-3 py-1.5 text-sm',
                                                    isOwn
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted',
                                                    // Rounded corners based on grouping
                                                    isOwn
                                                        ? cn(
                                                              'rounded-l-2xl',
                                                              isFirst &&
                                                                  'rounded-tr-2xl rounded-br-lg',
                                                              !isFirst &&
                                                                  !isLast &&
                                                                  'rounded-r-lg',
                                                              isLast &&
                                                                  !isFirst &&
                                                                  'rounded-br-2xl rounded-tr-lg',
                                                              isFirst && isLast && 'rounded-2xl'
                                                          )
                                                        : cn(
                                                              'rounded-r-2xl',
                                                              isFirst &&
                                                                  'rounded-tl-2xl rounded-bl-lg',
                                                              !isFirst &&
                                                                  !isLast &&
                                                                  'rounded-l-lg',
                                                              isLast &&
                                                                  !isFirst &&
                                                                  'rounded-bl-2xl rounded-tl-lg',
                                                              isFirst && isLast && 'rounded-2xl'
                                                          )
                                                )}
                                            >
                                                <p className="whitespace-pre-wrap wrap-break-word">
                                                    {msg.content}
                                                </p>
                                                {isLast && (
                                                    <p
                                                        className={cn(
                                                            'mt-0.5 text-[10px]',
                                                            isOwn
                                                                ? 'text-right opacity-60'
                                                                : 'text-muted-foreground/70'
                                                        )}
                                                    >
                                                        {formatDate({
                                                            date: msg.created_at,
                                                            format: 'hh:mm a',
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="flex shrink-0 items-center gap-2 border-t border-border/50 px-3 py-2.5">
                <Input
                    className="flex-1"
                    disabled={isBusy}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="Write a message..."
                    value={newMessage}
                />
                <Button
                    className="shrink-0"
                    disabled={!newMessage.trim() || isBusy}
                    onClick={handleSend}
                    size="icon"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

/** Group messages by date for Telegram-style date separators. */
function groupMessagesByDate(messages: Message[]): { date: string; msgs: Message[] }[] {
    const groups: { date: string; msgs: Message[] }[] = [];

    for (const msg of messages) {
        const dateLabel = getDateLabel(msg.created_at);
        const lastGroup = groups[groups.length - 1];

        if (lastGroup && lastGroup.date === dateLabel) {
            lastGroup.msgs.push(msg);
        } else {
            groups.push({ date: dateLabel, msgs: [msg] });
        }
    }

    return groups;
}

/** Get a human-readable date label (Today, Yesterday, or full date). */
function getDateLabel(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();

    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    // Same year
    if (date.getFullYear() === now.getFullYear()) {
        return formatDate({ date: dateStr, format: 'mmm DD' });
    }

    return formatDate({ date: dateStr, format: 'mmm DD, YYYY' });
}
