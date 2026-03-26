'use client';

import {
    ChartColumnBig,
    ChartLine,
    ChartNoAxesCombined,
    ChartPie,
    Shield,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from 'nhb-toolbox';
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
import { DataTable, SortableColumn } from '@/components/misc/data-table';
import UserAvatar from '@/components/misc/user-avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PollDetailResponse, PollVoterDetail } from '@/types/polls';

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

type Props = {
    poll: PollDetailResponse;
    isAdmin: boolean;
};

export default function PollAnalytics({ poll, isAdmin }: Props) {
    const { logged_in_votes, anonymous_votes, options, total_votes, voters } = poll ?? {};

    // Chart data
    const pieData = options.map((opt, i) => ({
        name: opt.text,
        value: opt.votes,
        fill: CHART_COLORS[i % CHART_COLORS.length],
    }));

    const barData = options.map((opt, i) => ({
        name: opt.text.length > 20 ? `${opt.text.slice(0, 17)}...` : opt.text,
        votes: opt.votes,
        percentage: opt.percentage || 0,
        fill: CHART_COLORS[i % CHART_COLORS.length],
    }));

    const voteTypeData = [
        { name: 'Logged-in Users', value: logged_in_votes, fill: '#3b82f6' },
        { name: 'Anonymous', value: anonymous_votes, fill: '#94a3b8' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
                <ChartNoAxesCombined /> Poll Analytics
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Pie Chart - Vote Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ChartPie /> Vote Distribution
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
                                    labelLine={true}
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
                        <CardTitle className="text-base flex items-center gap-2">
                            <ChartColumnBig /> Votes per Option
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer height={300} width="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip formatter={(value) => [`${value} votes`, 'Votes']} />
                                <Bar dataKey="votes" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Voter Type Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users /> Voter Breakdown
                        </CardTitle>
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
                                    {logged_in_votes}
                                </p>
                                <p className="text-xs text-muted-foreground">Logged-in votes</p>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                                <p className="text-2xl font-bold text-slate-400">
                                    {anonymous_votes}
                                </p>
                                <p className="text-xs text-muted-foreground">Anonymous votes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ChartLine /> Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-muted rounded-lg">
                                <p className="text-2xl font-bold">{total_votes}</p>
                                <p className="text-xs text-muted-foreground">Total Votes</p>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                                <p className="text-2xl font-bold">{options.length}</p>
                                <p className="text-xs text-muted-foreground">Options</p>
                            </div>
                        </div>

                        {/* Leading option */}
                        {options.length > 0 && (
                            <div className="p-3 bg-muted rounded-lg space-y-1">
                                <p className="text-xs text-muted-foreground font-medium">
                                    Leading Option
                                </p>
                                <p className="font-semibold">
                                    {options.reduce((a, b) => (a.votes > b.votes ? a : b)).text}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {
                                        options.reduce((a, b) => (a.votes > b.votes ? a : b))
                                            .percentage
                                    }
                                    % of total votes
                                </p>
                            </div>
                        )}

                        {/* Participation rate for logged in users */}
                        {total_votes > 0 && (
                            <div className="p-3 bg-muted rounded-lg space-y-1">
                                <p className="text-xs text-muted-foreground font-medium">
                                    Authenticated Participation
                                </p>
                                <p className="text-lg font-semibold">
                                    {Math.round((logged_in_votes / total_votes) * 100)}%
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Admin: Voter Details Table */}
            {isAdmin && voters && voters.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Shield className="size-4" />
                            Voter Details (Admin Only)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <VoterTable voters={voters} />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function VoterTable({ voters }: { voters: PollVoterDetail[] }) {
    return (
        <DataTable
            columns={[
                {
                    accessorKey: 'user_name',
                    header: ({ column }) => <SortableColumn column={column} header="Voter" />,
                    cell: ({ row: { original: voter } }) => {
                        return (
                            <div className="flex items-center gap-2">
                                <UserAvatar
                                    image={voter.user_image}
                                    name={voter.user_name || 'Anonymous'}
                                    size="xs"
                                />
                                {voter.is_anonymous ? (
                                    <span className="text-muted-foreground italic">
                                        Anonymous
                                    </span>
                                ) : (
                                    <Link
                                        className="font-medium"
                                        href={`/users/${voter.user_id}`}
                                    >
                                        <Button className="px-0" size={'sm'} variant={'link'}>
                                            {voter.user_name}
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        );
                    },
                },
                {
                    accessorKey: 'option_id',
                    header: ({ column }) => <SortableColumn column={column} header="Option" />,
                    cell: ({ row: { original: voter } }) => {
                        return <div>{voter.option_text}</div>;
                    },
                },
                {
                    accessorKey: 'voted_at',
                    header: ({ column }) => (
                        <SortableColumn column={column} header="Voted At" />
                    ),
                    cell: ({ row: { original: voter } }) => {
                        return (
                            <div>
                                {formatDate({
                                    date: voter.voted_at,
                                    format: 'mmm DD, YYYY hh:mm a',
                                })}
                            </div>
                        );
                    },
                },
            ]}
            data={voters}
        />
    );
}
