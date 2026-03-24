import type { pollOptions, pollStatusEnum, polls, pollVotes } from '@/lib/drizzle/schema/polls';

export type PollStatus = (typeof pollStatusEnum.enumValues)[number];

export type SelectPoll = typeof polls.$inferSelect;
export type InsertPoll = Omit<typeof polls.$inferInsert, 'id' | 'created_at' | 'updated_at'>;

export type SelectPollOption = typeof pollOptions.$inferSelect;
export type InsertPollOption = Omit<typeof pollOptions.$inferInsert, 'id' | 'created_at'>;

export type SelectPollVote = typeof pollVotes.$inferSelect;
export type InsertPollVote = Omit<typeof pollVotes.$inferInsert, 'id' | 'created_at'>;

export interface PollOption extends SelectPollOption {
    percentage?: number;
}

export interface PollDetail extends SelectPoll {
    options: PollOption[];
    status: PollStatus;
}

export interface PaginatedPolls {
    polls: PollDetail[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PollCreationResponse {
    id: number;
    question: string;
    is_anonymous: boolean;
    created_at: Date;
}
