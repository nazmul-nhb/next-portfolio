import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';

export interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    content: string;
    is_read: boolean;
    created_at: string;
}

export interface Conversation {
    id: number;
    participant_one: number;
    participant_two: number;
    last_message_at: string | null;
    created_at: string;
    otherUser: {
        id: number;
        name: string;
        profile_image: string | null;
    };
}

/**
 * Fetch all conversations
 */
export function useConversations() {
    return useApiQuery<Conversation[]>('conversations', '/api/messages/conversations');
}

/**
 * Fetch messages for a specific conversation
 */
export function useConversationMessages(conversationId: number | null) {
    return useApiQuery<Message[]>(
        ['conversation-messages', String(conversationId)],
        `/api/messages/conversations/${conversationId}` as `/api/messages`,
        {
            enabled: conversationId !== null,
            refetchInterval: 5000, // Poll every 5 seconds for new messages
        }
    );
}

/**
 * Send a message in a conversation
 */
export function useSendMessage(conversationId: number) {
    return useApiMutation<Message, { content: string }>(
        `/api/messages/conversations/${conversationId}` as `/api/messages`,
        'POST',
        {
            invalidateKeys: [
                'conversations',
                ['conversation-messages', String(conversationId)],
            ],
        }
    );
}

/**
 * Start a new conversation
 */
export function useStartConversation() {
    return useApiMutation<Conversation, { recipient_id: number; content: string }>(
        '/api/messages/conversations' as `/api/messages`,
        'POST',
        {
            successMessage: 'Conversation started',
            invalidateKeys: 'conversations',
        }
    );
}
