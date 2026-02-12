'use client';

import { MessageSquare, Send, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { FadeInUp } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { httpRequest } from '@/lib/actions/baseRequest';

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

/** Messages page with conversation list and chat view. */
export default function MessagesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [recipientId, setRecipientId] = useState('');

    const fetchConversations = useCallback(async () => {
        try {
            const { data } = await httpRequest<Conversation[]>('/api/messages/conversations' as '/api/messages');
            if (data) setConversations(data);
        } catch {
            // No conversations yet
        }
    }, []);

    const fetchMessages = useCallback(async (conversationId: number) => {
        try {
            const { data } = await httpRequest<Message[]>(
                `/api/messages/conversations/${conversationId}` as '/api/messages'
            );
            if (data) setMessages(data);
        } catch {
            // Error loading messages
        }
    }, []);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchConversations();
        }
    }, [status, router, fetchConversations]);

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation);
            const interval = setInterval(() => fetchMessages(activeConversation), 5000);
            return () => clearInterval(interval);
        }
    }, [activeConversation, fetchMessages]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        setSending(true);
        try {
            // If there's an active conversation, send to that conversation
            if (activeConversation) {
                await httpRequest<null, Record<string, unknown>>(
                    `/api/messages/conversations/${activeConversation}` as '/api/messages',
                    {
                        method: 'POST',
                        body: { content: newMessage },
                    }
                );
                setNewMessage('');
                fetchMessages(activeConversation);
            } else if (recipientId) {
                // Create a new conversation
                const { data } = await httpRequest<Conversation, Record<string, unknown>>(
                    '/api/messages/conversations' as '/api/messages',
                    {
                        method: 'POST',
                        body: { participant_id: recipientId },
                    }
                );
                if (data) {
                    setActiveConversation(data.id);
                    setRecipientId('');
                    // Send the message
                    await httpRequest<null, Record<string, unknown>>(
                        `/api/messages/conversations/${data.id}` as '/api/messages',
                        {
                            method: 'POST',
                            body: { content: newMessage },
                        }
                    );
                    setNewMessage('');
                    fetchConversations();
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

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
                                            src={conv.otherUser.profile_image}
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
                                            {new Date(
                                                conv.last_message_at
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}

                        {/* New conversation */}
                        <div className="border-t border-border/50 pt-3">
                            <p className="mb-2 text-xs text-muted-foreground">
                                Start new conversation
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    className="h-8 text-xs"
                                    onChange={(e) => setRecipientId(e.target.value)}
                                    placeholder="User ID"
                                    value={recipientId}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Chat area */}
                    <div className="flex flex-col rounded-xl border border-border/50 bg-card">
                        {activeConversation ? (
                            <>
                                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                                    {messages.map((msg) => (
                                        <div
                                            className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${
                                                msg.sender_id === Number(session.user.id)
                                                    ? 'ml-auto bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                            }`}
                                            key={msg.id}
                                        >
                                            <p>{msg.content}</p>
                                            <p className="mt-1 text-xs opacity-60">
                                                {new Date(msg.created_at).toLocaleTimeString(
                                                    'en-US',
                                                    {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    }
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 border-t border-border/50 p-4">
                                    <Input
                                        disabled={sending}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' && !e.shiftKey && handleSend()
                                        }
                                        placeholder="Type a message..."
                                        value={newMessage}
                                    />
                                    <Button
                                        disabled={!newMessage.trim() || sending}
                                        onClick={handleSend}
                                        size="icon"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </>
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
