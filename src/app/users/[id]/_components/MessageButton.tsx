'use client';

import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useApiMutation } from '@/lib/hooks/use-api';
import { useChatBubbleStore } from '@/lib/store/chat-bubble-store';

interface MessageButtonProps {
    userId: number;
    userName: string;
}

/** Button to initiate or resume a DM conversation with a user. */
export default function MessageButton({ userId, userName }: MessageButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const { openBubble } = useChatBubbleStore();

    const { mutate: startConversation, isPending } = useApiMutation<
        { id: number },
        { participant_id: number }
    >('/api/messages/conversations', 'POST', {
        silentSuccessMessage: true,
        silentErrorMessage: true,
        onSuccess: (conversation) => {
            openBubble(conversation.id);
        },
        onError: () => {
            // Fallback: navigate to messages page
            router.push('/messages');
        },
    });

    // Don't show if not authenticated or viewing own profile
    if (!session?.user || +session.user.id === userId) return null;

    return (
        <Button
            className="gap-2"
            disabled={isPending}
            loading={isPending}
            onClick={() => startConversation({ participant_id: userId })}
            size="sm"
            variant="outline"
        >
            {!isPending && <MessageCircle className="h-4 w-4" />}
            Message {userName.split(' ')[0]}
        </Button>
    );
}
