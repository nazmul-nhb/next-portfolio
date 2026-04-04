import type { VoidFn } from 'nhb-toolbox/types';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import type { Message } from '@/types/messages';

/**
 * Custom hook to manage messages for a given conversation.
 *
 * @param activeConvId - The ID of the active conversation. If null, messages won't be fetched.
 * @param onSuccess - Callback function to be called after successfully sending a message.
 * @returns An object containing the messages, loading state, send message function, and sending state.
 */
export function useMessages(activeConvId: number | null, onSuccess: VoidFn) {
    const { data = [], isLoading } = useApiQuery<Message[]>(
        `/api/messages/conversations/${activeConvId}`,
        {
            enabled: !!activeConvId,
            refetchInterval: 10000,
            queryKey: ['messages', activeConvId],
        }
    );

    const { mutate, isPending } = useApiMutation<null, { content: string }>(
        `/api/messages/conversations/${activeConvId ?? 0}`,
        'POST',
        {
            silentSuccessMessage: true,
            invalidateKeys: ['messages', 'conversations', 'unread-conversations'],
            onError: (error) => console.error('Failed to send message:', error),
            onSuccess,
        }
    );

    return {
        messages: data,
        isMsgsLoading: isLoading,
        sendMsg: mutate,
        isMsgSending: isPending,
    };
}
