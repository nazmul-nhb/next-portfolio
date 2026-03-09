'use client';

import { Search, X } from 'lucide-react';
import { useDebouncedValue } from 'nhb-hooks';
import { useState } from 'react';
import { ConversationItemSkeleton } from '@/components/misc/skeletons';
import UserAvatar from '@/components/misc/user-avatar';
import { Input } from '@/components/ui/input';
import { useApiQuery } from '@/lib/hooks/use-api';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Conversation, UserResult } from '@/types/messages';

type Props = {
    conversations: Conversation[];
    activeConversationId: number | null;
    onSelectConversation: (id: number) => void;
    onSelectNewRecipient: (user: UserResult) => void;
    isLoading?: boolean;
    className?: string;
};

export default function ConversationList({
    conversations,
    activeConversationId,
    onSelectConversation,
    onSelectNewRecipient,
    isLoading,
    className,
}: Props) {
    const [searchText, setSearchText] = useState('');
    const [debouncedSearch] = useDebouncedValue(searchText);
    const [showDropdown, setShowDropdown] = useState(true);

    const { data: searchResults = [], isFetching: searching } = useApiQuery<UserResult[]>(
        `/api/users/search?q=${encodeURIComponent(debouncedSearch)}`,
        {
            enabled: debouncedSearch.length >= 2,
            staleTime: 10000,
            queryKey: ['user-search', debouncedSearch],
        }
    );

    const handleSearchChange = (value: string) => {
        setSearchText(value);
        setShowDropdown(true);
    };

    const clearSearch = () => {
        setSearchText('');
        setShowDropdown(false);
    };

    const handleSelectUser = (user: UserResult) => {
        // Check if there's an existing conversation with this user
        const existing = conversations.find((c) => c.otherUser.id === user.id);

        if (existing) {
            onSelectConversation(existing.id);
        } else {
            onSelectNewRecipient(user);
        }

        setSearchText('');
        setShowDropdown(false);
    };

    return (
        <div className={cn('flex h-full flex-col bg-card', className)}>
            {/* Header */}
            <div className="shrink-0 border-b border-border/50 px-4 py-3">
                <h1 className="text-lg font-semibold">Messages</h1>
            </div>

            {/* Search */}
            <div className="relative shrink-0 border-b border-border/50 px-3 py-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="h-9 pl-9 pr-8 text-sm"
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search users..."
                        value={searchText}
                    />
                    {searchText && (
                        <button
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={clearSearch}
                            type="button"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>

                {/* Search results dropdown */}
                {showDropdown && debouncedSearch.length >= 2 && searchResults.length > 0 && (
                    <div className="absolute left-2 right-2 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
                        {searchResults.map((user) => (
                            <button
                                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                                key={user.id}
                                onClick={() => handleSelectUser(user)}
                                type="button"
                            >
                                <UserAvatar
                                    image={user.profile_image}
                                    name={user.name}
                                    size="sm"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-sm">{user.name}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
                {searching && (
                    <p className="mt-1 px-1 text-xs text-muted-foreground">Searching...</p>
                )}
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto custom-scroll">
                {isLoading ? (
                    Array.from({ length: 6 }, (_, i) => <ConversationItemSkeleton key={i} />)
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                        <p className="text-sm text-muted-foreground">No conversations yet.</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Search for a user to start chatting.
                        </p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <button
                            className={cn(
                                'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/20',
                                activeConversationId === conv.id
                                    ? 'bg-primary/10'
                                    : 'hover:bg-muted/50'
                            )}
                            key={conv.id}
                            onClick={() => onSelectConversation(conv.id)}
                            type="button"
                        >
                            <UserAvatar
                                image={conv.otherUser.profile_image}
                                name={conv.otherUser.name}
                                size="md"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-baseline justify-between gap-2">
                                    <p className="truncate text-sm font-medium">
                                        {conv.otherUser.name}
                                    </p>
                                    <span className="shrink-0 text-[11px] text-muted-foreground">
                                        {formatRelativeTime(conv.last_message_at)}
                                    </span>
                                </div>
                                <p className="truncate text-xs text-muted-foreground">
                                    {conv.otherUser.email}
                                </p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
