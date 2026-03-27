'use client';

import { MessageCircleQuestionMark, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FloatingButton from '@/components/ui/floating-button';
import { useApiQuery } from '@/lib/hooks/use-api';
import { useUserProfile } from '@/lib/hooks/use-user';
import type { ContactMessage } from '@/types/messages';

export function AdminUnreadMessage() {
    const router = useRouter();

    const { data: user } = useUserProfile();

    const { data: messages, isLoading } = useApiQuery<ContactMessage[]>(
        '/api/contact?unread=true',
        {
            queryKey: ['unread-messages'],
        }
    );

    const MessageCount = () => (
        <div className="relative">
            <MessageCircleQuestionMark className="animate-bounce size-5" />
            <span className="absolute -top-3.5 -right-2.5 text-xs font-cascadia p-0.5">
                {isLoading ? 0 : messages?.length}
            </span>
        </div>
    );

    return user?.role === 'admin' && messages?.length ? (
        <FloatingButton
            className="bottom-20 right-4"
            icon={MessageCount}
            onClick={() => router.push('/admin/messages')}
            position="bottom-right"
            shape="square"
            showLabel={false}
            variant="destructive"
        />
    ) : null;
}

type UnreadCount = {
    unread_count: number;
};

export function UnreadMessage() {
    const { data: user } = useUserProfile();

    const { data: conversations = { unread_count: 0 }, isLoading } = useApiQuery<UnreadCount>(
        '/api/messages/conversations/unread',
        {
            enabled: user != null,
            refetchInterval: 5000,
            queryKey: ['unread-conversations'],
        }
    );

    return (
        <div className="relative">
            <MessageSquare className="size-4" />
            {user && conversations.unread_count > 0 && (
                <span className="absolute -top-3 -right-2 text-xs font-source-sans font-semibold p-0.5 size-4.5 flex items-center justify-center rounded-full bg-red-600 text-white">
                    {isLoading ? 0 : conversations?.unread_count}
                </span>
            )}
        </div>
    );
}
