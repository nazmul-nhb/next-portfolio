'use client';

import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { formatDate, formatWithPlural } from 'nhb-toolbox';
import { toTitleCase } from 'nhb-toolbox/change-case';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { PollDetail } from '@/types/polls';

interface PollCardProps {
    poll: PollDetail;
    onViewDetails: (poll: PollDetail) => void;
    hasVoted: boolean;
}

export function PollCard({ poll, onViewDetails, hasVoted }: PollCardProps) {
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
        <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="transition-shadow h-full flex flex-col"
            initial={{ opacity: 0, y: 20 }}
        >
            <Card className="flex flex-col gap-4 flex-1">
                {/* Header */}
                <CardHeader className="space-y-0 gap-0">
                    <CardTitle className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-base leading-tight flex-1">
                            {poll.question}
                        </h3>
                        <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[poll.status]}`}
                        >
                            {statusIcons[poll.status]}
                            {toTitleCase(poll.status)}
                        </span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {formatDate({
                            date: poll.created_at,
                            format: 'mmm DD, YYYY hh:mm:ss a',
                        })}
                    </p>
                </CardHeader>

                {/* Options Preview */}
                <CardContent className="space-y-2 flex-1">
                    {poll.options.slice(0, 3).map((option) => (
                        <div className="space-y-1" key={option.id}>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium truncate">{option.text}</span>
                                <span className="text-xs text-muted-foreground">
                                    {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                                </span>
                            </div>
                            <Progress className="h-2" value={option.percentage || 0} />
                        </div>
                    ))}
                    {poll.options.length > 3 && (
                        <p className="text-xs text-muted-foreground pt-1">
                            +{poll.options.length - 3} more{' '}
                            {poll.options.length - 3 === 1 ? 'option' : 'options'}
                        </p>
                    )}
                </CardContent>

                {/* Footer */}
                <CardFooter className="flex items-center justify-between py-3">
                    <div className="text-xs text-muted-foreground">
                        {formatWithPlural(poll.total_votes, 'vote')} • Total options:{' '}
                        {poll.options.length}
                    </div>
                    <Button
                        disabled={poll.status === 'expired'}
                        onClick={() => onViewDetails(poll)}
                        size="sm"
                        variant={hasVoted ? 'outline' : 'default'}
                    >
                        {hasVoted ? '✓ Voted' : 'Vote'}
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
