import { desc } from 'drizzle-orm';
import { MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { MessagesClient } from './_components/MessagesClient';
import { db } from '@/lib/drizzle';
import { contactMessages } from '@/lib/drizzle/schema';

export const metadata: Metadata = {
    title: 'Contact Messages',
    description: 'Manage contact form messages',
};

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
    let messages: (typeof contactMessages.$inferSelect)[] = [];

    try {
        messages = await db
            .select()
            .from(contactMessages)
            .orderBy(desc(contactMessages.created_at));
    } catch (error) {
        console.error('Failed to fetch messages:', error);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-purple-600" />
                <div>
                    <h1 className="text-3xl font-bold">Contact Messages</h1>
                    <p className="text-muted-foreground">
                        Messages from your portfolio contact form
                    </p>
                </div>
            </div>

            <MessagesClient initialMessages={messages} />
        </div>
    );
}
