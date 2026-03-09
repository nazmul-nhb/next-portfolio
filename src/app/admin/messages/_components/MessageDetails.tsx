import { Check, Clock, Mail, User, X } from 'lucide-react';
import { formatDate } from 'nhb-toolbox';
import type { Dispatch, MouseEvent, SetStateAction } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { ContactMessage } from '@/types/messages';

type Props = {
    selectedMessage: ContactMessage | null;
    setSelectedMessage: Dispatch<SetStateAction<ContactMessage | null>>;
    processingId: number | null;
    handleToggleRead: (e: MouseEvent, id: number, currentStatus: boolean) => void;
};

export default function MessageDetails({
    handleToggleRead,
    processingId,
    selectedMessage,
    setSelectedMessage,
}: Props) {
    return (
        <Dialog
            onOpenChange={(open) => {
                if (!open) setSelectedMessage(null);
            }}
            open={!!selectedMessage}
        >
            <DialogContent className="max-h-[85vh] overflow-y-auto max-w-80 sm:max-w-lg">
                <DialogHeader className={selectedMessage ? '' : 'sr-only'}>
                    <DialogTitle className="flex items-center gap-2">
                        {selectedMessage ? (
                            <Fragment>
                                <User className="size-5 text-primary" />
                                {selectedMessage.name}
                            </Fragment>
                        ) : (
                            'Message Details'
                        )}
                    </DialogTitle>
                    <DialogDescription className="flex flex-col items-start gap-1">
                        {selectedMessage ? (
                            <Fragment>
                                <a
                                    className="text-primary hover:underline"
                                    href={`mailto:${selectedMessage.email}`}
                                >
                                    {selectedMessage.email}
                                </a>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="size-3" />
                                    {formatDate({
                                        date: selectedMessage.created_at,
                                        format: 'mmm DD, yyyy [at] hh:mm:ss a',
                                    })}
                                </span>
                            </Fragment>
                        ) : (
                            'No message selected.'
                        )}
                    </DialogDescription>
                </DialogHeader>

                {selectedMessage && (
                    <Fragment>
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
                                        <X className="mr-1.5 size-3.5" />
                                        Mark Unread
                                    </Fragment>
                                ) : (
                                    <Fragment>
                                        <Check className="mr-1.5 size-3.5" />
                                        Mark Read
                                    </Fragment>
                                )}
                            </Button>
                            <Button asChild size="sm" variant="outline">
                                <a href={`mailto:${selectedMessage.email}`}>
                                    <Mail className="mr-1.5 size-3.5" />
                                    Reply
                                </a>
                            </Button>
                        </div>
                    </Fragment>
                )}
            </DialogContent>
        </Dialog>
    );
}
