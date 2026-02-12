'use client';

import { MessageCircle, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FadeInUp } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { httpRequest } from '@/lib/actions/baseRequest';

interface Conversation {
    id: number;
    user1_id: number;
    user2_id: number;
    last_message_at: Date | null;
    created_at: Date;
    updated_at: Date;
    otherUser: {
        id: number;
        name: string;
        profile_image: string | null;
    };
}

interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    content: string;
    is_read: boolean;
    created_at: Date;
}

interface MessagesClientProps {
    userId: number;
}

export function MessagesClient({ userId }: MessagesClientProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch messages for selected conversation
    const fetchMessages = async (conversationId: number) => {
        try {
            const { data } = await httpRequest<Message[]>(
                `/api/messages/conversations/${conversationId}`
            );
            if (data) {
                setMessages(data);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            toast.error('Failed to load messages');
        }
    };

    // Send message
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        setSending(true);
        try {
            await httpRequest(`/api/messages/conversations/${selectedConversation}`, {
                method: 'POST',
                body: { content: newMessage },
            });

            setNewMessage('');
            await fetchMessages(selectedConversation);
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Initial load
    useEffect(() => {
        // Fetch conversations
        const fetchConversations = async () => {
            try {
                const { data } = await httpRequest<Conversation[]>(
                    '/api/messages/conversations'
                );
                if (data) {
                    setConversations(data);
                }
            } catch (error) {
                console.error('Failed to fetch conversations:', error);
                toast.error('Failed to load conversations');
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    // Polling for new messages (every 5 seconds)
    useEffect(() => {
        if (!selectedConversation) return;

        const $fetchMessages = async (conversationId: number) => {
            try {
                const { data } = await httpRequest<Message[]>(
                    `/api/messages/conversations/${conversationId}`
                );
                if (data) {
                    setMessages(data);
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
                toast.error('Failed to load messages');
            }
        };

        // Load messages when conversation is selected
        if (selectedConversation) {
            $fetchMessages(selectedConversation);
        }

        const interval = setInterval(() => {
            $fetchMessages(selectedConversation);
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedConversation]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-12">
            <FadeInUp>
                <h1 className="mb-8 text-3xl font-bold">Messages</h1>
            </FadeInUp>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Conversations List */}
                <FadeInUp delay={0.1}>
                    <Card className="p-4">
                        <h2 className="mb-4 text-lg font-semibold">Conversations</h2>
                        {conversations.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-8 text-center text-muted-foreground">
                                <MessageCircle className="h-12 w-12" />
                                <p className="text-sm">No conversations yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {conversations.map((conv) => (
                                    <button
                                        className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                                            selectedConversation === conv.id
                                                ? 'border-primary bg-accent'
                                                : 'border-border'
                                        }`}
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv.id)}
                                        type="button"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                                {conv.otherUser.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {conv.otherUser.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {conv.last_message_at
                                                        ? new Date(
                                                              conv.last_message_at
                                                          ).toLocaleDateString()
                                                        : 'No messages'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </Card>
                </FadeInUp>

                {/* Messages Area */}
                <FadeInUp className="lg:col-span-2" delay={0.2}>
                    <Card className="flex h-150 flex-col">
                        {selectedConversation ? (
                            <>
                                {/* Messages */}
                                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                                    {messages.map((msg) => (
                                        <div
                                            className={`flex ${
                                                msg.sender_id === userId
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                            }`}
                                            key={msg.id}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                                    msg.sender_id === userId
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted'
                                                }`}
                                            >
                                                <p className="text-sm">{msg.content}</p>
                                                <p
                                                    className={`mt-1 text-xs ${
                                                        msg.sender_id === userId
                                                            ? 'text-primary-foreground/70'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    {new Date(
                                                        msg.created_at
                                                    ).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="border-t border-border p-4">
                                    <div className="flex gap-2">
                                        <Input
                                            className="flex-1"
                                            disabled={sending}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            placeholder="Type a message..."
                                            value={newMessage}
                                        />
                                        <Button
                                            disabled={!newMessage.trim() || sending}
                                            onClick={handleSendMessage}
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
                                <MessageCircle className="h-16 w-16" />
                                <p>Select a conversation to start messaging</p>
                            </div>
                        )}
                    </Card>
                </FadeInUp>
            </div>
        </div>
    );
}
