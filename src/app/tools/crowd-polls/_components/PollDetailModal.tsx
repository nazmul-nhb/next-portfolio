'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { toTitleCase } from 'nhb-toolbox/change-case';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import type { PollDetail } from '@/types/polls';

interface PollDetailModalProps {
    poll: PollDetail | null;
    isOpen: boolean;
    onClose: () => void;
    onVote: (optionId: number) => void;
    isVoting: boolean;
    hasVoted: boolean;
    votedOptionId?: number;
}

export function PollDetailModal({
    poll,
    isOpen,
    onClose,
    onVote,
    isVoting,
    hasVoted,
    votedOptionId,
}: PollDetailModalProps) {
    if (!poll) return null;

    const statusIcons = {
        upcoming: <Clock className="size-5" />,
        active: <CheckCircle2 className="size-5 text-green-600" />,
        expired: <AlertCircle className="size-5 text-red-600" />,
    };

    const statusColors = {
        upcoming:
            'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-100 border-blue-200 dark:border-blue-800',
        active: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-100 border-green-200 dark:border-green-800',
        expired:
            'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-100 border-red-200 dark:border-red-800',
    };

    const canVote = poll.status === 'active' && !hasVoted;

    return (
        <Dialog onOpenChange={onClose} open={isOpen}>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 text-left">
                            <DialogTitle>{poll.question}</DialogTitle>
                            <DialogDescription className="mt-2">
                                {new Date(poll.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </DialogDescription>
                        </div>
                        <span
                            className={`inline-flex items-center gap-1 px-2 py-1 mr-3 rounded-full text-xs font-medium border whitespace-nowrap ${statusColors[poll.status]}`}
                        >
                            {statusIcons[poll.status]}
                            {toTitleCase(poll.status)}
                        </span>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Options */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium">Options ({poll.options.length})</p>
                        <AnimatePresence>
                            {poll.options.map((option, index) => (
                                <motion.div
                                    animate={{ opacity: 1, x: 0 }}
                                    initial={{ opacity: 0, x: -20 }}
                                    key={option.id}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <button
                                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                                            canVote && !isVoting
                                                ? 'hover:border-primary hover:bg-accent cursor-pointer'
                                                : 'cursor-not-allowed opacity-75'
                                        } ${
                                            votedOptionId === option.id
                                                ? 'bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700'
                                                : 'bg-card'
                                        }`}
                                        disabled={!canVote || isVoting}
                                        onClick={() => canVote && onVote(option.id)}
                                        type="button"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium flex-1">
                                                    {option.text}
                                                </span>
                                                <div className="text-xs text-muted-foreground text-right">
                                                    <div>{option.votes} votes</div>
                                                    <div className="font-medium">
                                                        {option.percentage || 0}%
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Progress
                                                    className="flex-1 h-2"
                                                    value={option.percentage || 0}
                                                />
                                                {votedOptionId === option.id && (
                                                    <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Vote Count and Status */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                        <span>{poll.total_votes} total votes</span>
                        {hasVoted && (
                            <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                <CheckCircle2 className="size-4" />
                                You voted
                            </span>
                        )}
                    </div>

                    {/* Status Message */}
                    {poll.status === 'expired' && (
                        <div className="p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-100 rounded-lg text-sm">
                            This poll has ended. No more votes can be cast.
                        </div>
                    )}

                    {poll.status === 'upcoming' && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-100 rounded-lg text-sm">
                            This poll hasn't started yet. Voting will be available when it
                            begins.
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button onClick={onClose} variant="destructive">
                        {hasVoted || poll.status !== 'active' ? 'Close' : 'Cancel'}
                    </Button>
                    {canVote && (
                        <Badge className="text-xs" variant="secondary">
                            Select an option to vote
                        </Badge>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
