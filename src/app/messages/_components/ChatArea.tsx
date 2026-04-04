'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import { Chronos, formatDate } from 'nhb-toolbox';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { ChatAreaSkeleton } from '@/components/misc/skeletons';
import SmartTooltip from '@/components/misc/smart-tooltip';
import UserAvatar from '@/components/misc/user-avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { httpRequest } from '@/lib/actions/baseRequest';
import { useMessages } from '@/lib/hooks/use-msg';
import { useChatBubbleStore } from '@/lib/store/chat-bubble-store';
import { useUserStore } from '@/lib/store/user-store';
import { cipher, cn, groupMessagesByDate } from '@/lib/utils';
import type { Conversation, UserResult } from '@/types/messages';

type Props = {
    activeConvId: number | null;
    conversations: Conversation[];
    selectedRecipient: UserResult | null;
    onBack: () => void;
    onConversationCreated: (convId: number) => void;
};

export default function ChatArea({
    activeConvId,
    conversations,
    selectedRecipient,
    onBack,
    onConversationCreated,
}: Props) {
    const [newMessage, setNewMessage] = useState('');
    const { profile } = useUserStore();
    const queryClient = useQueryClient();
    const { openBubble: popOutToBubble } = useChatBubbleStore();
    const scrollRef = useRef<HTMLDivElement>(null);
    const prevConvRef = useRef<number | null>(null);
    const prevMsgCountRef = useRef(0);
    const inputRef = useRef<HTMLInputElement>(null);

    /** Scroll the messages container to the bottom. */
    const scrollToBottom = useCallback((instant = false) => {
        const el = scrollRef.current;
        if (el) {
            el.scrollTo({ top: el.scrollHeight, behavior: instant ? 'instant' : 'smooth' });
        }
    }, []);

    // Find the other user from the active conversation
    const activeConv = conversations.find((c) => c.id === activeConvId);
    const chatPartner = activeConv?.otherUser ?? selectedRecipient;

    const { messages, isMsgsLoading, sendMsg, isMsgSending } = useMessages(activeConvId, () =>
        setNewMessage('')
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
            queryClient.invalidateQueries({
                queryKey: ['conversations', 'unread-conversations'],
            });
            queryClient.invalidateQueries({ queryKey: ['messages', conv.id] });
        },
        onError: (error) => console.error('Failed to create conversation:', error),
    });

    const handleSend = () => {
        if (!newMessage.trim()) return;

        const encryptedMsg = cipher.encrypt(newMessage);

        if (activeConvId) {
            sendMsg({ content: encryptedMsg });
        } else if (selectedRecipient) {
            createAndSend({ email: selectedRecipient.email, message: encryptedMsg });
        }

        inputRef?.current?.focus();
    };

    // Scroll to bottom: instantly on conversation switch, smoothly on new messages
    useEffect(() => {
        if (!activeConvId) return;

        const isNewConversation = prevConvRef.current !== activeConvId;
        const hasNewMessages = messages.length > prevMsgCountRef.current;

        if (isNewConversation) {
            // First entering a conversation — instant jump
            requestAnimationFrame(() => scrollToBottom(true));
        } else if (hasNewMessages) {
            // New message arrived or sent — smooth scroll
            scrollToBottom(false);
        }

        prevConvRef.current = activeConvId;
        prevMsgCountRef.current = messages.length;
        inputRef?.current?.focus();
    }, [activeConvId, messages.length, scrollToBottom]);

    // Group messages by date
    const groupedMessages = groupMessagesByDate(messages);

    // No conversation or recipient selected
    if (!activeConvId && !selectedRecipient) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-card/50">
                <MessageSquare className="mb-4 size-16 text-muted-foreground/30" />
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

    // Show skeleton while messages are loading for the first time
    if (activeConvId && isMsgsLoading && messages.length === 0) {
        return <ChatAreaSkeleton />;
    }

    const isBusy = isMsgSending || creatingConversation;

    return (
        <div className="flex h-full flex-col bg-card/50">
            {/* Chat header / title bar */}
            <div className="flex shrink-0 items-center gap-3 border-b border-border/50 px-3 py-2.5">
                <button
                    className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-muted md:hidden"
                    onClick={onBack}
                    type="button"
                >
                    <ArrowLeft className="size-5" />
                </button>
                {chatPartner && (
                    <Fragment>
                        <UserAvatar
                            className="size-9"
                            image={chatPartner.profile_image}
                            name={chatPartner.name}
                        />
                        <div className="min-w-0 flex-1">
                            <Link className="hover:underline" href={`/users/${chatPartner.id}`}>
                                <p className="truncate text-sm font-semibold">
                                    {chatPartner.name}
                                </p>
                            </Link>

                            <p className="truncate text-xs text-muted-foreground">
                                {chatPartner.email}
                            </p>
                        </div>
                    </Fragment>
                )}
                {/* Pop out to bubble */}
                {activeConvId && (
                    <button
                        className="ml-auto shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        onClick={() => popOutToBubble(activeConvId)}
                        type="button"
                    >
                        <SmartTooltip
                            content="Pop out to bubble"
                            trigger={<ExternalLink className="size-4" />}
                        />
                    </button>
                )}
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto custom-scroll px-4 py-3" ref={scrollRef}>
                {activeConvId && messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            No messages yet. Say hello!
                        </p>
                    </div>
                ) : !activeConvId && selectedRecipient ? (
                    <div className="flex h-full flex-col items-center justify-center">
                        <UserAvatar
                            className="mb-3 size-20"
                            image={selectedRecipient.profile_image}
                            name={selectedRecipient.name}
                        />
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

                                    const isSameMin = nextMsg?.created_at
                                        ? new Chronos(msg.created_at).isSame(
                                              nextMsg?.created_at,
                                              'minute'
                                          )
                                        : false;

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
                                                    {cipher.decrypt(msg.content)}
                                                </p>
                                                {isSameMin || (
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
                    ref={inputRef}
                    value={newMessage}
                />
                <Button
                    className="shrink-0"
                    disabled={!newMessage.trim() || isBusy}
                    onClick={handleSend}
                    size="icon"
                >
                    <Send className="size-4" />
                </Button>
            </div>
        </div>
    );
}
