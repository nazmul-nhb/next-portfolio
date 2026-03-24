import type { PollDetail } from '@/types/polls';

export interface CreatePollFormData {
    question: string;
    options: string[];
    start_date?: string;
    end_date?: string;
    is_anonymous: boolean;
}

export interface PollCardProps {
    poll: PollDetail;
    onVote?: (pollId: number, optionId: number) => void;
    hasVoted?: (pollId: number) => boolean;
}

export interface PollDetailModalProps {
    poll: PollDetail | null;
    isOpen: boolean;
    onClose: () => void;
    onVote: (optionId: number) => void;
    isVoting?: boolean;
    hasVoted: boolean;
}
