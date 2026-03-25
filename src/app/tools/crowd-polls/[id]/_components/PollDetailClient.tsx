'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Edit,
    RotateCcw,
    Shield,
    Trash2,
    UserIcon,
    Users,
    X,
} from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate, formatWithPlural } from 'nhb-toolbox';
import { toTitleCase } from 'nhb-toolbox/change-case';
import { Fragment, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import EmptyData from '@/components/misc/empty-data';
import ShareButton from '@/components/misc/share-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { PollDetail, PollVoterDetail } from '@/types/polls';

const CHART_COLORS = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#f97316',
    '#84cc16',
    '#6366f1',
];

interface PollDetailResponse extends PollDetail {
    anonymous_votes: number;
    logged_in_votes: number;
}

export function PollDetailClient({ pollId }: { pollId: number }) {
    const router = useRouter();

    const { profile } = useUserStore();

    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editEndDate, setEditEndDate] = useState('');

    const userId = profile?.id;
    const isAdmin = profile?.role === 'admin';

    const {
        data: poll,
        isLoading,
        refetch,
    } = useApiQuery<PollDetailResponse>(`/api/tools/polls/${pollId}`, {
        queryKey: ['poll-detail', pollId],
    });

    const { mutate: vote, isPending: isVoting } = useApiMutation<
        unknown,
        { poll_id: number; option_id: number }
    >(`/api/tools/polls/${pollId}/vote`, 'POST', {
        successMessage: 'Vote recorded!',
        prioritizeCustomMessages: true,
        invalidateKeys: ['poll-detail', 'polls-list'],
        onSuccess: () => refetch(),
    });

    const { mutate: unvote, isPending: isUnvoting } = useApiMutation<
        unknown,
        Record<string, never>
    >(`/api/tools/polls/${pollId}/vote`, 'DELETE', {
        successMessage: 'Vote removed!',
        prioritizeCustomMessages: true,
        invalidateKeys: ['poll-detail', 'polls-list'],
        onSuccess: () => refetch(),
    });

    const { mutate: updatePoll, isPending: isUpdating } = useApiMutation<
        unknown,
        { end_date?: string | null; question?: string }
    >(`/api/tools/polls/${pollId}`, 'PATCH', {
        successMessage: 'Poll updated!',
        invalidateKeys: ['poll-detail', 'polls-list'],
        onSuccess: () => {
            setShowEditDialog(false);
            refetch();
        },
    });

    const { mutate: deletePoll, isPending: isDeleting } = useApiMutation<
        unknown,
        Record<string, never>
    >(`/api/tools/polls/${pollId}`, 'DELETE', {
        successMessage: 'Poll deleted!',
        invalidateKeys: ['polls-list'],
        onSuccess: () => router.push('/tools/crowd-polls'),
    });

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
        unvote({});
    };

    const handleUpdateExpiry = () => {
        updatePoll({ end_date: editEndDate || null });
    };

    const handleDelete = () => {
        deletePoll({});
    };

    // Chart data
    const pieData = poll.options.map((opt, i) => ({
        name: opt.text,
        value: opt.votes,
        fill: CHART_COLORS[i % CHART_COLORS.length],
    }));

    const barData = poll.options.map((opt, i) => ({
        name: opt.text.length > 20 ? `${opt.text.slice(0, 17)}...` : opt.text,
        votes: opt.votes,
        percentage: opt.percentage || 0,
        fill: CHART_COLORS[i % CHART_COLORS.length],
    }));

    const voteTypeData = [
        { name: 'Logged-in Users', value: poll.logged_in_votes, fill: '#3b82f6' },
        { name: 'Anonymous', value: poll.anonymous_votes, fill: '#94a3b8' },
    ];

    const statusIcons = {
        upcoming: <Clock className="size-4 mb-0.5" />,
        active: <CheckCircle2 className="size-4 mb-0.5 text-green-600" />,
        expired: <AlertCircle className="size-4 mb-0.5 text-red-600" />,
    };

    const statusColors = {
        upcoming:
            'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-100 border-blue-200 dark:border-blue-800',
        active: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-100 border-green-200 dark:border-green-800',
        expired:
            'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-100 border-red-200 dark:border-red-800',
    };

    return (
        <Fragment>
            <div className="space-y-8">
                {/* Back Button & Share */}
                <div className="flex items-center justify-between">
                    <Link
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        href="/tools/crowd-polls"
                    >
                        <ArrowLeft className="size-4" />
                        All Polls
                    </Link>
                    <ShareButton
                        buttonLabel="Share this poll"
                        route={`/tools/crowd-polls/${pollId}` as Route}
                        shareLabel={`Share: ${poll.question}`}
                    />
                </div>

                {/* Poll Header */}
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 space-y-2">
                            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                                {poll.question}
                            </h1>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                    <Calendar className="size-4" />
                                    {formatDate({
                                        date: poll.created_at,
                                        format: 'mmm DD, YYYY hh:mm a',
                                    })}
                                </span>
                                {poll.creator_name && (
                                    <span className="flex items-center gap-1">
                                        <UserIcon className="size-4" />
                                        {poll.creator_name}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Users className="size-4" />
                                    {formatWithPlural(poll.total_votes, 'vote')}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[poll.status]}`}
                            >
                                {statusIcons[poll.status]}
                                {toTitleCase(poll.status)}
                            </span>
                            {poll.is_anonymous && (
                                <Badge variant="secondary">
                                    <Shield className="size-3 mr-1" />
                                    Anonymous
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Expiry Info */}
                    {poll.end_date && (
                        <p className="text-sm text-muted-foreground">
                            {poll.status === 'expired' ? 'Expired' : 'Expires'}:{' '}
                            {formatDate({
                                date: poll.end_date,
                                format: 'mmm DD, YYYY hh:mm a',
                            })}
                        </p>
                    )}

                    {/* Admin/Creator Controls */}
                    {canManage && (
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => {
                                    setEditEndDate(
                                        poll.end_date
                                            ? new Date(poll.end_date).toISOString().slice(0, 16)
                                            : ''
                                    );
                                    setShowEditDialog(true);
                                }}
                                size="sm"
                                variant="outline"
                            >
                                <Edit className="size-4 mb-0.5" />
                                Edit Expiry
                            </Button>
                            <Button
                                onClick={() => setShowDeleteDialog(true)}
                                size="sm"
                                variant="destructive"
                            >
                                <Trash2 className="size-4 mb-1" />
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Voting Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>
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
                                const isVotedOption = poll.voted_option_id === option.id;
                                const isClickable =
                                    canVote && !isVoting && (!hasVoted || hasVoted);

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

                        {hasVoted && canVote && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
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
                    </CardContent>
                </Card>

                {/* Analytics Section */}
                {poll.total_votes > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Poll Analytics</h2>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Pie Chart - Vote Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Vote Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer height={300} width="100%">
                                        <PieChart>
                                            <Pie
                                                cx="50%"
                                                cy="50%"
                                                data={pieData}
                                                dataKey="value"
                                                innerRadius={60}
                                                label={({ name, percent }) =>
                                                    `${(name ?? '').length > 12 ? `${(name ?? '').slice(0, 10)}..` : name} ${((percent ?? 0) * 100).toFixed(0)}%`
                                                }
                                                labelLine={false}
                                                outerRadius={100}
                                                paddingAngle={2}
                                            />
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Bar Chart - Votes per Option */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Votes per Option
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer height={300} width="100%">
                                        <BarChart data={barData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value) => [
                                                    `${value} votes`,
                                                    'Votes',
                                                ]}
                                            />
                                            <Bar dataKey="votes" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Voter Type Breakdown */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Voter Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer height={250} width="100%">
                                        <PieChart>
                                            <Pie
                                                cx="50%"
                                                cy="50%"
                                                data={voteTypeData}
                                                dataKey="value"
                                                innerRadius={50}
                                                label={({ name, value }) => `${name}: ${value}`}
                                                outerRadius={80}
                                                paddingAngle={4}
                                            />
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <p className="text-2xl font-bold text-blue-500">
                                                {poll.logged_in_votes}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Logged-in votes
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <p className="text-2xl font-bold text-slate-400">
                                                {poll.anonymous_votes}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Anonymous votes
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Summary Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <p className="text-2xl font-bold">
                                                {poll.total_votes}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Total Votes
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <p className="text-2xl font-bold">
                                                {poll.options.length}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Options
                                            </p>
                                        </div>
                                    </div>

                                    {/* Leading option */}
                                    {poll.options.length > 0 && (
                                        <div className="p-3 bg-muted rounded-lg space-y-1">
                                            <p className="text-xs text-muted-foreground font-medium">
                                                Leading Option
                                            </p>
                                            <p className="font-semibold">
                                                {
                                                    poll.options.reduce((a, b) =>
                                                        a.votes > b.votes ? a : b
                                                    ).text
                                                }
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {
                                                    poll.options.reduce((a, b) =>
                                                        a.votes > b.votes ? a : b
                                                    ).percentage
                                                }
                                                % of total votes
                                            </p>
                                        </div>
                                    )}

                                    {/* Participation rate for logged in users */}
                                    {poll.total_votes > 0 && (
                                        <div className="p-3 bg-muted rounded-lg space-y-1">
                                            <p className="text-xs text-muted-foreground font-medium">
                                                Authenticated Participation
                                            </p>
                                            <p className="text-lg font-semibold">
                                                {Math.round(
                                                    (poll.logged_in_votes / poll.total_votes) *
                                                        100
                                                )}
                                                %
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Admin: Voter Details Table */}
                        {isAdmin && poll.voters && poll.voters.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Shield className="size-4" />
                                        Voter Details (Admin Only)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <VoterTable voters={poll.voters} />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
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
                                onChange={(e) => setEditEndDate(e.target.value)}
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

            {/* Delete Confirmation Dialog */}
            <Dialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Poll</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this poll? This action cannot be
                            undone and will remove all votes.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => setShowDeleteDialog(false)}
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isDeleting}
                            loading={isDeleting}
                            onClick={handleDelete}
                            variant="destructive"
                        >
                            Delete Poll
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Fragment>
    );
}

function VoterTable({ voters }: { voters: PollVoterDetail[] }) {
    return (
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b">
                    <th className="text-left p-2 font-medium">Voter</th>
                    <th className="text-left p-2 font-medium">Option</th>
                    <th className="text-left p-2 font-medium">Voted At</th>
                </tr>
            </thead>
            <tbody>
                {voters.map((voter, i) => (
                    <tr className="border-b last:border-0" key={i}>
                        <td className="p-2">
                            {voter.is_anonymous ? (
                                <span className="text-muted-foreground italic">Anonymous</span>
                            ) : (
                                <span className="font-medium">{voter.user_name}</span>
                            )}
                        </td>
                        <td className="p-2">{voter.option_text}</td>
                        <td className="p-2 text-muted-foreground">
                            {formatDate({
                                date: voter.voted_at,
                                format: 'mmm DD, YYYY hh:mm a',
                            })}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
