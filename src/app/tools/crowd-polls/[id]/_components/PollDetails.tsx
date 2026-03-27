'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CheckCircle2, RotateCcw, Vote, X } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Chronos, formatDate, formatWithPlural } from 'nhb-toolbox';
import { Fragment, useState } from 'react';
import PollAnalytics from '@/app/tools/crowd-polls/[id]/_components/PollAnalytics';
import PollHeader from '@/app/tools/crowd-polls/[id]/_components/PollHeader';
import { confirmToast } from '@/components/misc/confirm';
import EmptyData from '@/components/misc/empty-data';
import ShareButton from '@/components/misc/share-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { useUserStore } from '@/lib/store/user-store';
import { buildLocalISOString, toDateTimeLocalValue } from '@/lib/utils';
import type { PollDetailResponse } from '@/types/polls';

type VoteCast = { poll_id: number; option_id: number };
type UpdatePoll = { end_date?: string | null; question?: string };

export function PollDetails({ pollId }: { pollId: number }) {
    const router = useRouter();

    const { profile } = useUserStore();

    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editEndDate, setEditEndDate] = useState('');

    const userId = profile?.id;
    const isAdmin = profile?.role === 'admin';

    const { data: poll, isLoading } = useApiQuery<PollDetailResponse>(
        `/api/tools/polls/${pollId}`,
        {
            queryKey: ['poll-detail', pollId],
        }
    );

    const { mutate: vote, isPending: isVoting } = useApiMutation<unknown, VoteCast>(
        `/api/tools/polls/${pollId}/vote`,
        'POST',
        {
            successMessage: 'Vote recorded!',
            prioritizeCustomMessages: true,
            invalidateKeys: ['poll-detail', 'polls-list'],
        }
    );

    const { mutate: unvote, isPending: isUnvoting } = useApiMutation<unknown, null>(
        `/api/tools/polls/${pollId}/vote`,
        'DELETE',
        {
            successMessage: 'Vote removed!',
            prioritizeCustomMessages: true,
            invalidateKeys: ['poll-detail', 'polls-list'],
        }
    );

    const { mutate: updatePoll, isPending: isUpdating } = useApiMutation<unknown, UpdatePoll>(
        `/api/tools/polls/${pollId}`,
        'PATCH',
        {
            invalidateKeys: ['poll-detail', 'polls-list'],
            onSuccess: () => {
                setShowEditDialog(false);
            },
        }
    );

    const { mutate: deletePoll, isPending: isDeleting } = useApiMutation<unknown, null>(
        `/api/tools/polls/${pollId}`,
        'DELETE',
        {
            invalidateKeys: ['polls-list'],
        }
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                <div className="h-64 bg-muted rounded-lg animate-pulse" />
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="h-80 bg-muted rounded-lg animate-pulse" />
                    <div className="h-80 bg-muted rounded-lg animate-pulse" />
                </div>
            </div>
        );
    }

    if (!poll) {
        return (
            <EmptyData
                description={
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            This poll may have been deleted or does not exist.
                        </p>
                        <Link href="/tools/crowd-polls">
                            <Button variant="outline">
                                <ArrowLeft className="size-4 mr-2" />
                                Back to Polls
                            </Button>
                        </Link>
                    </div>
                }
                Icon={AlertCircle}
                title="Poll Not Found"
            />
        );
    }

    const hasVoted = poll.voted_option_id != null;
    const canVote = poll.status === 'active';
    const canManage = isAdmin || (userId != null && poll.user_id === userId);

    const handleVote = (optionId: number) => {
        if (!canVote || isVoting) return;
        vote({ poll_id: pollId, option_id: optionId });
    };

    const handleUnvote = () => {
        if (!hasVoted || isUnvoting) return;
        unvote(null);
    };

    const handleUpdateExpiry = () => {
        updatePoll({
            end_date: buildLocalISOString(editEndDate, new Chronos().getUTCOffset()),
        });
    };

    const handleDelete = () => {
        confirmToast({
            title: 'Delete this poll?',
            isLoading: isDeleting,
            description: 'This action cannot be undone and will remove all votes.',
            confirmText: 'Delete Poll',
            onConfirm: () =>
                deletePoll(null, { onSuccess: () => router.push('/tools/crowd-polls') }),
        });
    };

    return (
        <Fragment>
            <div className="space-y-8">
                {/* Back Button & Share */}
                <div className="flex items-center justify-between">
                    <Link href="/tools/crowd-polls">
                        <Button
                            className="gap-2 font-semibold text-muted-foreground"
                            size="sm"
                            variant="secondary"
                        >
                            <ArrowLeft className="size-4 mb-0.5" />
                            All Polls
                        </Button>
                    </Link>
                    <ShareButton
                        buttonLabel="Share this poll"
                        route={`/tools/crowd-polls/${pollId}` as Route}
                        shareLabel={`Share: ${poll.question}`}
                    />
                </div>

                {/* Poll Header */}
                <PollHeader
                    canManage={canManage}
                    isDeleting={isDeleting}
                    ondelete={handleDelete}
                    poll={poll}
                    setEditEndDate={setEditEndDate}
                    setShowEditDialog={setShowEditDialog}
                />

                <Separator />

                {/* Voting Section */}
                <Card className="select-none">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Vote />
                                {hasVoted
                                    ? 'Your Vote'
                                    : canVote
                                      ? 'Cast Your Vote'
                                      : 'Results'}
                            </span>
                            {hasVoted && canVote && (
                                <div className="flex gap-2">
                                    <Badge className="text-xs" variant="secondary">
                                        <CheckCircle2 className="size-3 mr-1" />
                                        Voted
                                    </Badge>
                                    {userId && (
                                        <Button
                                            disabled={isUnvoting}
                                            loading={isUnvoting}
                                            onClick={handleUnvote}
                                            size="sm"
                                            variant="destructive"
                                        >
                                            <X className="size-4 mr-1" />
                                            Unvote
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <AnimatePresence>
                            {poll.options.map((option, index) => {
                                const isVotedOption =
                                    hasVoted &&
                                    Number(poll.voted_option_id) === Number(option.id);
                                const isClickable = canVote && !isVoting;

                                return (
                                    <motion.div
                                        animate={{ opacity: 1, x: 0 }}
                                        initial={{ opacity: 0, x: -20 }}
                                        key={option.id}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <button
                                            className={`w-full text-left p-4 rounded-lg border transition-all ${
                                                isClickable && !isVoting
                                                    ? 'hover:border-primary hover:bg-accent cursor-pointer'
                                                    : poll.status !== 'active'
                                                      ? 'cursor-default'
                                                      : 'cursor-wait'
                                            } ${
                                                isVotedOption
                                                    ? 'bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700 ring-2 ring-green-200 dark:ring-green-800'
                                                    : 'bg-card'
                                            }`}
                                            disabled={!canVote || isVoting}
                                            onClick={() => handleVote(option.id)}
                                            type="button"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium flex-1 flex items-center gap-2">
                                                        {option.text}
                                                        {isVotedOption && (
                                                            <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                                                        )}
                                                    </span>
                                                    <div className="text-sm text-muted-foreground text-right">
                                                        <span className="font-semibold">
                                                            {option.percentage || 0}%
                                                        </span>
                                                        <span className="ml-2">
                                                            (
                                                            {formatWithPlural(
                                                                option.votes,
                                                                'vote'
                                                            )}
                                                            )
                                                        </span>
                                                    </div>
                                                </div>
                                                <Progress
                                                    className="h-3"
                                                    value={option.percentage || 0}
                                                />
                                            </div>
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </CardContent>

                    <CardFooter className="py-3 space-y-2">
                        {hasVoted && canVote && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <RotateCcw className="size-4" />
                                Click another option to change your vote
                            </div>
                        )}

                        {/* Status Messages */}
                        {poll.status === 'expired' && (
                            <div className="p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-100 rounded-lg text-sm">
                                This poll has ended. No more votes can be cast.
                            </div>
                        )}
                        {poll.status === 'upcoming' && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-100 rounded-lg text-sm">
                                This poll hasn't started yet. Voting will begin on{' '}
                                {formatDate({
                                    date: poll.start_date,
                                    format: 'mmm DD, YYYY hh:mm a',
                                })}
                                .
                            </div>
                        )}
                    </CardFooter>
                </Card>

                {/* Analytics Section */}
                {poll.total_votes > 0 && <PollAnalytics isAdmin={isAdmin} poll={poll} />}
            </div>

            {/* Edit Expiry Dialog */}
            <Dialog onOpenChange={setShowEditDialog} open={showEditDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Poll Expiry</DialogTitle>
                        <DialogDescription>
                            Set or change when this poll expires. Clear the date to make it
                            never expire.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium" htmlFor="end-date-input">
                                Expiry Date & Time
                            </label>
                            <Input
                                id="end-date-input"
                                onChange={(e) =>
                                    setEditEndDate(toDateTimeLocalValue(e.target.value))
                                }
                                type="datetime-local"
                                value={editEndDate}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => setShowEditDialog(false)}
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isUpdating}
                            loading={isUpdating}
                            onClick={handleUpdateExpiry}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Fragment>
    );
}
