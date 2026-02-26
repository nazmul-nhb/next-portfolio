export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    is_read: boolean;
    is_replied: boolean;
    created_at: Date;
}

export interface Conversation {
    id: number;
    participant_one: number;
    participant_two: number;
    last_message_at: string;
    created_at: string;
    otherUser: {
        id: number;
        name: string;
        profile_image: string | null;
        email: string;
    };
}

export interface Message {
    id: number;
    content: string;
    sender_id: number;
    is_read: boolean;
    created_at: string;
}

export interface UserResult {
    id: number;
    name: string;
    email: string;
    profile_image: string | null;
}
