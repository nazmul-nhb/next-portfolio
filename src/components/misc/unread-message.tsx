'use client';

import { MessageCircleQuestionMark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FloatingButton from '@/components/ui/floating-button';
import { useApiQuery } from '@/lib/hooks/use-api';
import { useUserProfile } from '@/lib/hooks/use-user';
import type { ContactMessage } from '@/types/messages';

export default function UnreadMessage() {
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
