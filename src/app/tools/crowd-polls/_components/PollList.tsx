'use client';

import { InboxIcon, Search } from 'lucide-react';
import { generateQueryParams } from 'nhb-toolbox';
import { Fragment, useMemo, useState } from 'react';
import EmptyData from '@/components/misc/empty-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import type { PaginatedPolls, PollDetail } from '@/types/polls';
import { PollCard } from './PollCard';
import { PollDetailModal } from './PollDetailModal';

interface PollListProps {
    onCreateClick: () => void;
}

export function PollList({ onCreateClick }: PollListProps) {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<'all' | 'active' | 'upcoming' | 'expired'>('all');
    const [sort, setSort] = useState<'latest' | 'mostVotes'>('latest');
    const [page, setPage] = useState(1);
    const [selectedPoll, setSelectedPoll] = useState<PollDetail | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [votedPollIds, setVotedPollIds] = useState<Set<number>>(new Set());
    const [votingPollId, setVotingPollId] = useState<number | null>(null);

    const pollsParams = useMemo(() => {
        return generateQueryParams({
            search: query.trim() ? query.trim() : '',
            status: status !== 'all' ? status : '',
            sort,
            page: page,
            limit: 12,
        });
    }, [query, status, sort, page]);

    const { data: pollsData, isLoading: pollsLoading } = useApiQuery<PaginatedPolls>(
        `/api/tools/polls${pollsParams}`,
        {
            queryKey: ['polls-list', pollsParams],
        }
    );

    const { mutate: vote, isPending: isVoting } = useApiMutation<
        unknown,
        { poll_id: number; option_id: number }
    >(`/api/tools/polls/${selectedPoll?.id}/vote`, 'POST', {
        successMessage: 'Vote recorded!',
        prioritizeCustomMessages: true,
        invalidateKeys: ['polls-list', pollsParams],
        onSuccess: () => {
            if (selectedPoll) {
                setVotedPollIds(new Set(votedPollIds).add(selectedPoll.id));
            }
        },
    });

    const polls = pollsData?.polls || [];
    const totalPages = pollsData?.totalPages || 1;

    const handleVote = (optionId: number) => {
        if (!selectedPoll) return;
        setVotingPollId(selectedPoll.id);
        vote({ poll_id: selectedPoll.id, option_id: optionId });
    };

    const handlePollSelect = (poll: PollDetail) => {
        setSelectedPoll(poll);
        setIsDetailOpen(true);
    };

    const isDetailModalVoting = votingPollId === selectedPoll?.id && isVoting;
    const hasVoted = selectedPoll ? votedPollIds.has(selectedPoll.id) : false;

    return (
        <div className="space-y-6">
            {/* Header with Controls */}
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                            <Input
                                className="pl-10"
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search polls..."
                                value={query}
                            />
                        </div>
                    </div>
                    <Button onClick={onCreateClick} size={'lg'}>
                        Create Poll
                    </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Select
                        onValueChange={(value: string) =>
                            setSort(value as 'latest' | 'mostVotes')
                        }
                        value={sort}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="latest">Latest</SelectItem>
                            <SelectItem value="mostVotes">Most Votes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Status Tabs */}
            <Tabs
                className="w-full"
                onValueChange={(value: string) => {
                    setStatus(value as 'all' | 'active' | 'upcoming' | 'expired');
                    setPage(1);
                }}
                value={status}
            >
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="expired">Expired</TabsTrigger>
                </TabsList>

                {['all', 'active', 'upcoming', 'expired'].map((tabStatus) => (
                    <TabsContent className="space-y-4" key={tabStatus} value={tabStatus}>
                        {pollsLoading ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        className="h-48 bg-muted rounded-lg animate-pulse"
                                        key={i}
                                    />
                                ))}
                            </div>
                        ) : polls.length > 0 ? (
                            <Fragment>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {polls.map((poll) => (
                                        <PollCard
                                            hasVoted={votedPollIds.has(poll.id)}
                                            key={poll.id}
                                            onViewDetails={handlePollSelect}
                                            poll={poll}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-4">
                                        <Button
                                            disabled={page === 1}
                                            onClick={() => setPage(Math.max(1, page - 1))}
                                            size="sm"
                                            variant="outline"
                                        >
                                            Previous
                                        </Button>
                                        <div className="text-sm">
                                            Page {page} of {totalPages}
                                        </div>
                                        <Button
                                            disabled={page === totalPages}
                                            onClick={() =>
                                                setPage(Math.min(totalPages, page + 1))
                                            }
                                            size="sm"
                                            variant="outline"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </Fragment>
                        ) : (
                            <EmptyData
                                description={
                                    query || status !== 'all'
                                        ? 'Try adjusting your search or filters'
                                        : 'Create the first poll to get started!'
                                }
                                Icon={InboxIcon}
                                title="No polls found"
                            />
                        )}
                    </TabsContent>
                ))}
            </Tabs>

            {/* Detail Modal */}
            <PollDetailModal
                hasVoted={hasVoted}
                isOpen={isDetailOpen}
                isVoting={isDetailModalVoting}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedPoll(null);
                }}
                onVote={handleVote}
                poll={selectedPoll}
                // votedOptionId={isDetailModalVoting ? undefined : selectedPoll?.options[0]?.id}
            />
        </div>
    );
}
