'use client';

import { Check, Mail, MailOpen, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { toast } from 'sonner';
import MessageDetails from '@/app/admin/messages/_components/MessageDetails';
import { confirmToast } from '@/components/misc/confirm';
import SmartTooltip from '@/components/misc/smart-tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { ContactMessage } from '@/types/messages';

interface MessagesClientProps {
    initialMessages: ContactMessage[];
}

export function MessagesClient({ initialMessages }: MessagesClientProps) {
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    const { data: messages = initialMessages } = useApiQuery<ContactMessage[]>('/api/contact', {
        queryKey: ['contact-messages'],
    });

    const { mutate: toggleRead } = useApiMutation<ContactMessage, { is_read: boolean }>(
        `/api/contact/${processingId}`,
        'PATCH',
        { invalidateKeys: ['contact-messages'], silentSuccessMessage: true }
    );

    const { mutate: deleteMsg } = useApiMutation<ContactMessage>(
        `/api/contact?id=${processingId}`,
        'DELETE',
        {
            invalidateKeys: ['contact-messages'],
            successMessage: 'Message has been deleted',
            errorMessage: 'Failed to delete message',
        }
    );

    const handleToggleRead = (e: React.MouseEvent, id: number, currentStatus: boolean) => {
        e.stopPropagation();
        setProcessingId(id);
        toggleRead(
            { is_read: !currentStatus },
            {
                onSuccess: () => {
                    if (selectedMessage?.id === id) {
                        setSelectedMessage((prev) =>
                            prev ? { ...prev, is_read: !currentStatus } : null
                        );
                    }
                    toast.success(currentStatus ? 'Marked as unread' : 'Marked as read');
                },
                onSettled: () => setProcessingId(null),
            }
        );
    };

    const handleDelete = (e: React.MouseEvent, id: number, name: string) => {
        e.stopPropagation();
        confirmToast({
            onConfirm: () => {
                setProcessingId(id);
                deleteMsg(null, {
                    onSuccess: () => selectedMessage?.id === id && setSelectedMessage(null),
                    onSettled: () => setProcessingId(null),
                });
            },
            title: `Delete message from "${name}"?`,
            description: 'This action cannot be undone!',
            confirmText: 'Delete',
        });
    };

    const handleOpenMessage = (message: ContactMessage) => {
        setSelectedMessage(message);

        if (!message.is_read) {
            setProcessingId(message.id);
            toggleRead(
                { is_read: true },
                {
                    onSuccess: () =>
                        setSelectedMessage((prev) =>
                            prev ? { ...prev, is_read: true } : null
                        ),
                    onSettled: () => setProcessingId(null),
                }
            );
        }
    };

    const unreadCount = messages.filter((m) => !m.is_read).length;

    if (messages.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <Mail className="mb-4 size-12 text-muted-foreground/40" />
                    <p className="text-lg font-medium text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground/70">
                        Messages from your contact form will appear here.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Fragment>
            {/* Stats bar */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{messages.length} total</span>
                {unreadCount > 0 && (
                    <span className="flex items-center gap-1.5 font-medium text-primary">
                        <span className="size-2 animate-pulse rounded-full bg-primary" />
                        {unreadCount} unread
                    </span>
                )}
            </div>

            {/* Message list */}
            <div className="space-y-2">
                {messages.map((message) => (
                    <div
                        className={cn(
                            'group relative flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all hover:shadow-md cursor-pointer z-10',
                            message.is_read
                                ? 'border-border/50 bg-card/50 hover:bg-card'
                                : 'border-primary/20 bg-card shadow-sm'
                        )}
                        key={message.id}
                        onClick={() => handleOpenMessage(message)}
                    >
                        {/* Unread indicator */}
                        {!message.is_read && (
                            <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                        )}

                        {/* Avatar */}
                        <div
                            className={cn(
                                'flex size-10 shrink-0 items-center justify-center rounded-full',
                                message.is_read
                                    ? 'bg-muted text-muted-foreground'
                                    : 'bg-primary/10 text-primary'
                            )}
                        >
                            <User className="size-5" />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span
                                    className={cn(
                                        'truncate text-sm',
                                        !message.is_read && 'font-semibold'
                                    )}
                                >
                                    {message.name}
                                </span>
                                {message.subject && (
                                    <Fragment>
                                        <span className="hidden sm:inline-block text-muted-foreground/40">
                                            &middot;
                                        </span>
                                        <span className="hidden sm:inline-block truncate text-sm text-muted-foreground">
                                            {message.subject}
                                        </span>
                                    </Fragment>
                                )}
                            </div>
                            <p className="mt-0.5 truncate text-sm text-muted-foreground">
                                {message.message}
                            </p>
                        </div>

                        {/* Time & actions */}
                        <div className="flex shrink-0 items-center gap-1">
                            <span className="mr-2 hidden text-xs text-muted-foreground sm:inline">
                                {formatRelativeTime(message.created_at)}
                            </span>
                            <Button
                                disabled={processingId === message.id}
                                onClick={(e) =>
                                    handleToggleRead(e, message.id, message.is_read)
                                }
                                size="icon-sm"
                                variant="ghost"
                            >
                                <SmartTooltip
                                    content={message.is_read ? 'Mark unread' : 'Mark read'}
                                    trigger={
                                        message.is_read ? (
                                            <MailOpen className="size-3.5" />
                                        ) : (
                                            <Check className="size-3.5" />
                                        )
                                    }
                                />
                            </Button>
                            <Button
                                disabled={processingId === message.id}
                                onClick={(e) => handleDelete(e, message.id, message.name)}
                                size="icon-sm"
                                variant="ghost"
                            >
                                <SmartTooltip
                                    content="Delete"
                                    trigger={<Trash2 className="size-3.5 text-destructive" />}
                                />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message detail modal */}
            <MessageDetails
                handleToggleRead={handleToggleRead}
                processingId={processingId}
                selectedMessage={selectedMessage}
                setSelectedMessage={setSelectedMessage}
            />
        </Fragment>
    );
}
