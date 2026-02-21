'use client';

import { Check, Clock, Mail, MailOpen, Trash2, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { toast } from 'sonner';
import { confirmToast } from '@/components/confirm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { httpRequest } from '@/lib/actions/baseRequest';
import { cn, formatRelativeTime } from '@/lib/utils';

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
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    const handleToggleRead = async (
        e: React.MouseEvent,
        id: number,
        currentStatus: boolean
    ) => {
        e.stopPropagation();
        setProcessingId(id);
        try {
            await httpRequest(`/api/contact/${id}`, {
                method: 'PATCH',
                body: { is_read: !currentStatus },
            });

            setMessages(
                messages.map((m) => (m.id === id ? { ...m, is_read: !currentStatus } : m))
            );

            if (selectedMessage?.id === id) {
                setSelectedMessage((prev) =>
                    prev ? { ...prev, is_read: !currentStatus } : null
                );
            }

            toast.success(currentStatus ? 'Marked as unread' : 'Marked as read');
            router.refresh();
        } catch (error) {
            console.error('Failed to update message:', error);
            toast.error('Failed to update message');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
        e.stopPropagation();
        confirmToast({
            onConfirm: async () => {
                setProcessingId(id);
                try {
                    const { success } = await httpRequest(`/api/contact?id=${id}`, {
                        method: 'DELETE',
                    });

                    if (success) {
                        setMessages(messages.filter((m) => m.id !== id));
                        if (selectedMessage?.id === id) setSelectedMessage(null);
                        toast.success('Message deleted');
                        router.refresh();
                    }
                } catch (error) {
                    console.error('Failed to delete message:', error);
                    toast.error('Failed to delete message');
                } finally {
                    setProcessingId(null);
                }
            },
            title: `Delete message from "${name}"?`,
            description: 'This action cannot be undone!',
            confirmText: 'Delete',
        });
    };

    const handleOpenMessage = (message: ContactMessage) => {
        setSelectedMessage(message);

        // Auto-mark as read when opening
        if (!message.is_read) {
            httpRequest(`/api/contact/${message.id}`, {
                method: 'PATCH',
                body: { is_read: true },
            }).then(() => {
                setMessages((prev) =>
                    prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m))
                );
                router.refresh();
            });
        }
    };

    const unreadCount = messages.filter((m) => !m.is_read).length;

    if (messages.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <Mail className="mb-4 h-12 w-12 text-muted-foreground/40" />
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
                        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                        {unreadCount} unread
                    </span>
                )}
            </div>

            {/* Message list */}
            <div className="space-y-2">
                {messages.map((message) => (
                    // biome-ignore lint/a11y/noStaticElementInteractions: needs to be clickable for opening modal
                    // biome-ignore lint/a11y/useKeyWithClickEvents: same as above
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
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                                message.is_read
                                    ? 'bg-muted text-muted-foreground'
                                    : 'bg-primary/10 text-primary'
                            )}
                        >
                            <User className="h-5 w-5" />
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
                                    <>
                                        <span className="text-muted-foreground/40">
                                            &middot;
                                        </span>
                                        <span className="truncate text-sm text-muted-foreground">
                                            {message.subject}
                                        </span>
                                    </>
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
                                title={message.is_read ? 'Mark unread' : 'Mark read'}
                                variant="ghost"
                            >
                                {message.is_read ? (
                                    <MailOpen className="h-3.5 w-3.5" />
                                ) : (
                                    <Check className="h-3.5 w-3.5" />
                                )}
                            </Button>
                            <Button
                                disabled={processingId === message.id}
                                onClick={(e) => handleDelete(e, message.id, message.name)}
                                size="icon-sm"
                                title="Delete"
                                variant="ghost"
                            >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message detail modal */}
            <Dialog
                onOpenChange={(open) => {
                    if (!open) setSelectedMessage(null);
                }}
                open={!!selectedMessage}
            >
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                    {selectedMessage && (
                        <Fragment>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    {selectedMessage.name}
                                </DialogTitle>
                                <DialogDescription className="flex flex-col gap-1">
                                    <a
                                        className="text-primary hover:underline"
                                        href={`mailto:${selectedMessage.email}`}
                                    >
                                        {selectedMessage.email}
                                    </a>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {new Date(selectedMessage.created_at).toLocaleString(
                                            'en-US',
                                            {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            }
                                        )}
                                    </span>
                                </DialogDescription>
                            </DialogHeader>

                            {selectedMessage.subject && (
                                <div className="rounded-lg bg-muted/50 px-4 py-2">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Subject
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {selectedMessage.subject}
                                    </p>
                                </div>
                            )}

                            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {selectedMessage.message}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex gap-2">
                                    <Button
                                        disabled={processingId === selectedMessage.id}
                                        onClick={(e) =>
                                            handleToggleRead(
                                                e,
                                                selectedMessage.id,
                                                selectedMessage.is_read
                                            )
                                        }
                                        size="sm"
                                        variant="outline"
                                    >
                                        {selectedMessage.is_read ? (
                                            <Fragment>
                                                <X className="mr-1.5 h-3.5 w-3.5" />
                                                Mark Unread
                                            </Fragment>
                                        ) : (
                                            <>
                                                <Check className="mr-1.5 h-3.5 w-3.5" />
                                                Mark Read
                                            </>
                                        )}
                                    </Button>
                                    <Button asChild size="sm" variant="outline">
                                        <a href={`mailto:${selectedMessage.email}`}>
                                            <Mail className="mr-1.5 h-3.5 w-3.5" />
                                            Reply
                                        </a>
                                    </Button>
                                </div>
                                <Button
                                    disabled={processingId === selectedMessage.id}
                                    onClick={(e) =>
                                        handleDelete(
                                            e,
                                            selectedMessage.id,
                                            selectedMessage.name
                                        )
                                    }
                                    size="sm"
                                    variant="destructive"
                                >
                                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                    Delete
                                </Button>
                            </div>
                        </Fragment>
                    )}
                </DialogContent>
            </Dialog>
        </Fragment>
    );
}
