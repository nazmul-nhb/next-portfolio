import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, User } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from 'nhb-toolbox';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { httpRequest } from '@/lib/actions/baseRequest';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { useUserStore } from '@/lib/store/user-store';
import { buildCloudinaryUrl } from '@/lib/utils';
import type { Conversation, Message, UserResult } from '@/types/messages';

type Props = {
    activeConversation: number | null;
    selectedRecipient: UserResult | null;
    setSelectedRecipient: Dispatch<SetStateAction<UserResult | null>>;
    setRecipientSearch: Dispatch<SetStateAction<string>>;
    setActiveConversation: Dispatch<SetStateAction<number | null>>;
};

export default function ChatArea({
    activeConversation,
    selectedRecipient,
    setSelectedRecipient,
    setActiveConversation,
    setRecipientSearch,
}: Props) {
    const [newMessage, setNewMessage] = useState('');
    const { profile } = useUserStore();
    const queryClient = useQueryClient();

    const { data: messages = [] } = useApiQuery<Message[]>(
        `/api/messages/conversations/${activeConversation}`,
        {
            enabled: !!activeConversation,
            refetchInterval: 10000,
            queryKey: ['messages', activeConversation],
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

    const handleSend = () => {
        if (!newMessage.trim()) return;
        if (activeConversation) {
            sendMsg({ content: newMessage });
        } else if (selectedRecipient) {
            createAndSend({ email: selectedRecipient.email, message: newMessage });
        }
    };

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
            setNewMessage('');
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['messages', conv.id] });
        },
        onError: (error) => console.error('Failed to create conversation:', error),
    });

    return (
        <div className="flex flex-col rounded-xl border border-border/50 bg-card">
            {activeConversation ? (
                <Fragment>
                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                        {messages.map((msg) => (
                            <div
                                className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${
                                    msg.sender_id === profile?.id
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
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="Type a message..."
                            value={newMessage}
                        />
                        <Button
                            disabled={!newMessage.trim() || sending || creatingConversation}
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
                                src={buildCloudinaryUrl(selectedRecipient.profile_image)}
                                width={64}
                            />
                        ) : (
                            <User className="mb-3 h-16 w-16 rounded-full bg-muted p-3 text-muted-foreground" />
                        )}
                        <p className="text-sm font-medium">{selectedRecipient.name}</p>
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
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="Type a message..."
                            value={newMessage}
                        />
                        <Button
                            disabled={!newMessage.trim() || sending || creatingConversation}
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
    );
}
