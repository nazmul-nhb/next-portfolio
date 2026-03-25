'use client';

import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    Edit,
    Shield,
    Trash2,
    UserIcon,
    Users,
} from 'lucide-react';
import { useTimer, useToggle } from 'nhb-hooks';
import { formatDate, formatWithPlural } from 'nhb-toolbox';
import { toTitleCase } from 'nhb-toolbox/change-case';
import CodeBlock from '@/components/misc/code-block';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, parseToDurationString, toDateTimeLocalValue } from '@/lib/utils';
import type { PollDetailResponse, PollStatus } from '@/types/polls';

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

type Props = {
    poll: PollDetailResponse;
    canManage: boolean;
    setShowEditDialog: (show: boolean) => void;
    setEditEndDate: (date: string) => void;
    setShowDeleteDialog: (show: boolean) => void;
};

export default function PollHeader({
    poll,
    canManage,
    setEditEndDate,
    setShowDeleteDialog,
    setShowEditDialog,
}: Props) {
    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                        {poll.question}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                            <Calendar className="size-4 mb-0.5" />
                            {formatDate({
                                date: poll.created_at,
                                format: 'mmm DD, YYYY hh:mm a',
                            })}
                        </span>
                        {poll.creator_name && (
                            <span className="flex items-center gap-1">
                                <UserIcon className="size-4 mb-0.5" />
                                {poll.creator_name}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Users className="size-4 mb-0.5" />
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
            {poll.end_date && <EndDateInfo end_date={poll.end_date} status={poll.status} />}

            {/* Admin/Creator Controls */}
            {canManage && (
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => {
                            setEditEndDate(
                                poll.end_date ? toDateTimeLocalValue(poll.end_date) : ''
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
    );
}

type EndDateProps = { status: PollStatus; end_date: string | Date };

function EndDateInfo({ end_date, status }: EndDateProps) {
    const timer = useTimer(end_date);
    const [showTimer, toggleShowTimer] = useToggle([false, true]);
    const isActive = status === 'active';

    return (
        <div className="select-none space-y-1">
            <Button
                className={cn(
                    'text-sm pt-1 pb-0.5',
                    isActive ? 'cursor-pointer' : 'cursor-default'
                )}
                onClick={isActive ? toggleShowTimer : undefined}
                size="xs"
                variant={isActive ? 'secondary' : 'destructive'}
            >
                {status === 'expired' ? 'Expired' : 'Expires'}:{' '}
                {formatDate({
                    date: end_date,
                    format: 'mmm DD, YYYY hh:mm:ss a',
                })}
            </Button>
            {isActive && showTimer && (
                <CodeBlock className="font-digital text-sm animate-pulse px-2 py-0.5 bg-muted w-fit">
                    {parseToDurationString(timer)}
                </CodeBlock>
            )}
        </div>
    );
}
