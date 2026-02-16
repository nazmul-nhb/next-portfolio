import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';

interface Message {
    id: number;
    content: string;
    created_at: string;
    sender: {
        id: number;
        name: string;
        profile_image: string | null;
    };
}

interface Conversation {
    id: number;
    participant: {
        id: number;
        name: string;
        profile_image: string | null;
    };
    last_message: string;
    last_message_at: string;
    unread_count: number;
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
