'use client';

import { Check, Mail, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { httpRequest } from '@/lib/actions/baseRequest';

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    is_read: boolean;
    is_replied: boolean;
    created_at: Date;
}

interface MessagesClientProps {
    initialMessages: ContactMessage[];
}

export function MessagesClient({ initialMessages }: MessagesClientProps) {
    const router = useRouter();
    const [messages, setMessages] = useState(initialMessages);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const handleToggleRead = async (id: number, currentStatus: boolean) => {
        setProcessingId(id);
        try {
            await httpRequest(`/api/contact-messages/${id}`, {
                method: 'PATCH',
                body: { is_read: !currentStatus },
            });

            setMessages(
                messages.map((m) => (m.id === id ? { ...m, is_read: !currentStatus } : m))
            );
            toast.success(currentStatus ? 'Marked as unread' : 'Marked as read');
            router.refresh();
        } catch (error) {
            console.error('Failed to update message:', error);
            toast.error('Failed to update message');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        toast.custom(
            (t) => (
                <div className="flex items-center gap-3 rounded-lg border bg-background p-4 shadow-lg">
                    <div className="flex-1">
                        <p className="font-medium">Delete message from {name}?</p>
                        <p className="text-sm text-muted-foreground">
                            This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={async () => {
                                toast.dismiss(t);
                                setProcessingId(id);
                                try {
                                    await httpRequest(`/api/contact-messages?id=${id}`, {
                                        method: 'DELETE',
                                    });
                                    setMessages(messages.filter((m) => m.id !== id));
                                    toast.success('Message deleted');
                                    router.refresh();
                                } catch (error) {
                                    console.error('Failed to delete message:', error);
                                    toast.error('Failed to delete message');
                                } finally {
                                    setProcessingId(null);
                                }
                            }}
                            size="sm"
                            variant="destructive"
                        >
                            Delete
                        </Button>
                        <Button onClick={() => toast.dismiss(t)} size="sm" variant="outline">
                            Cancel
                        </Button>
                    </div>
                </div>
            ),
            { duration: 5000 }
        );
    };

    if (messages.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No messages yet</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {messages.map((message) => (
                <Card
                    className={message.is_read ? 'opacity-60' : 'border-primary/50'}
                    key={message.id}
                >
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">{message.name}</h3>
                                    {!message.is_read && (
                                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                            New
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">{message.email}</p>
                                {message.subject && (
                                    <p className="mt-1 text-sm font-medium">
                                        Subject: {message.subject}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    disabled={processingId === message.id}
                                    onClick={() =>
                                        handleToggleRead(message.id, message.is_read)
                                    }
                                    size="sm"
                                    variant="ghost"
                                >
                                    {message.is_read ? (
                                        <X className="h-4 w-4" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    disabled={processingId === message.id}
                                    onClick={() => handleDelete(message.id, message.name)}
                                    size="sm"
                                    variant="ghost"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap text-sm">{message.message}</p>
                        <p className="mt-4 text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
