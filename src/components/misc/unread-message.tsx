'use client';

import { MessageCircleQuestionMark, MessagesSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { isNumber } from 'nhb-toolbox';
import SmartTooltip from '@/components/misc/smart-tooltip';
import FloatingButton from '@/components/ui/floating-button';
import { useApiQuery } from '@/lib/hooks/use-api';
import { useUserProfile } from '@/lib/hooks/use-user';
import { isAdminUser } from '@/lib/utils';
import type { Uncertain } from '@/types';
import type { ContactMessage } from '@/types/messages';

/** Utility function to truncate unread message counts for display. */
const truncateCount = (count: Uncertain<number>, max = 99) => {
    if (!isNumber(count)) return 0;
    return count > max ? `${max}+` : count;
};

export function AdminUnreadMessage() {
    const router = useRouter();

    const { data: user } = useUserProfile();

    const { data: messages, isLoading } = useApiQuery<ContactMessage[]>(
        '/api/contact?unread=true',
        {
            enabled: isAdminUser(user?.role),
            refetchInterval: 5000,
            queryKey: ['unread-messages'],
        }
    );

    const MessageCount = () => (
        <div className="relative">
            <MessageCircleQuestionMark className="animate-bounce size-5" />
            <span className="absolute -top-3.5 -right-2.5 text-xs font-cascadia p-0.5">
                {isLoading ? 0 : truncateCount(messages?.length)}
            </span>
        </div>
    );

    return isAdminUser(user?.role) && messages?.length ? (
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
            refetchInterval: 15000,
            queryKey: ['unread-conversations'],
        }
    );

    return (
        <div className="relative">
            <SmartTooltip
                content="Messages"
                trigger={<MessagesSquare className="size-4.5" />}
            />
            {user && conversations.unread_count > 0 && (
                <span className="absolute -top-3 -right-2 text-xs font-source-sans font-semibold p-0.5 size-4.5 flex items-center justify-center rounded-full bg-red-600 text-white">
                    {isLoading ? 0 : truncateCount(conversations?.unread_count)}
                </span>
            )}
        </div>
    );
}
