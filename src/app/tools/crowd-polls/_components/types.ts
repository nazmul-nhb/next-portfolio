export interface CreatePollFormData {
    question: string;
    options: string[];
    start_date?: string;
    end_date?: string;
    is_anonymous: boolean;
}
