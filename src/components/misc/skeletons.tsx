import { Skeleton, SkeletonCircle, SkeletonLine } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ─── Messages / Chat ────────────────────────────────────────────────

/** Skeleton for a single conversation item in the sidebar list. */
function ConversationItemSkeleton() {
    return (
        <div className="flex w-full items-center gap-3 px-4 py-3 border-b border-border/20">
            <SkeletonCircle size="md" />
            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                    <SkeletonLine height="sm" width="md" />
                    <SkeletonLine height="xs" width="xs" />
                </div>
            </div>
        </div>
    );
}

/** Skeleton for the full conversation list sidebar. */
function ConversationListSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('flex h-full flex-col bg-card', className)}>
            {/* Header */}
            <div className="shrink-0 border-b border-border/50 px-4 py-3">
                <SkeletonLine height="lg" width="sm" />
            </div>
            {/* Search */}
            <div className="shrink-0 border-b border-border/50 px-3 py-2">
                <Skeleton className="h-9 w-full rounded-md" />
            </div>
            {/* Conversation items */}
            <div className="flex-1 overflow-hidden">
                {Array.from({ length: 6 }, (_, i) => (
                    <ConversationItemSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

/** Skeleton for the chat header bar. */
function ChatHeaderSkeleton() {
    return (
        <div className="flex shrink-0 items-center gap-3 border-b border-border/50 px-3 py-2.5">
            <SkeletonCircle className="md:hidden" size="sm" />
            <SkeletonCircle size="sm" />
            <div className="min-w-0 flex-1 space-y-1.5">
                <SkeletonLine height="sm" width="md" />
                <SkeletonLine height="xs" width="lg" />
            </div>
            <Skeleton className="ml-auto size-8 rounded-full" />
        </div>
    );
}

/** Skeleton for a single chat message bubble. */
function MessageBubbleSkeleton({ isOwn = false }: { isOwn?: boolean }) {
    return (
        <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
            <Skeleton
                className={cn('rounded-2xl', isOwn ? 'h-8 w-36 bg-primary/20' : 'h-8 w-44')}
            />
        </div>
    );
}

/** Skeleton for the full ChatArea (messages + input). */
function ChatAreaSkeleton() {
    return (
        <div className="flex h-full flex-col bg-card/50">
            <ChatHeaderSkeleton />
            {/* Messages */}
            <div className="flex-1 space-y-2 px-4 py-3">
                {/* Date separator */}
                <div className="my-4 flex items-center justify-center">
                    <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <MessageBubbleSkeleton />
                <MessageBubbleSkeleton isOwn />
                <MessageBubbleSkeleton />
                <MessageBubbleSkeleton />
                <MessageBubbleSkeleton isOwn />
                <MessageBubbleSkeleton isOwn />
                <MessageBubbleSkeleton />
            </div>
            {/* Input */}
            <div className="flex shrink-0 items-center gap-2 border-t border-border/50 px-3 py-2.5">
                <Skeleton className="h-9 flex-1 rounded-md" />
                <Skeleton className="size-9 shrink-0 rounded-md" />
            </div>
        </div>
    );
}

/** Full messages page skeleton — sidebar + chat area split. */
function MessagesPageSkeleton({
    mobile,
    isChatOpen,
}: {
    mobile: boolean;
    isChatOpen: boolean;
}) {
    return (
        <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl overflow-hidden border-x border-border/30">
            <div
                className={cn(
                    'h-full shrink-0 border-r border-border/30',
                    mobile ? (isChatOpen ? 'hidden' : 'w-full') : 'w-80'
                )}
            >
                <ConversationListSkeleton />
            </div>
            <div
                className={cn(
                    'h-full min-w-0 flex-1',
                    mobile ? (isChatOpen ? 'block' : 'hidden') : 'block'
                )}
            >
                <ChatAreaSkeleton />
            </div>
        </div>
    );
}

// ─── Chat Bubble Panel ──────────────────────────────────────────────

/** Skeleton for the mini chat panel inside the bubble. */
function BubbleChatPanelSkeleton() {
    return (
        <>
            {/* Header */}
            <div className="flex shrink-0 items-center gap-2 border-b border-border/50 px-3 py-2">
                <SkeletonCircle className="size-7" size="xs" />
                <SkeletonLine className="flex-1" height="sm" width="md" />
                <Skeleton className="size-6 rounded-md" />
                <Skeleton className="size-6 rounded-md" />
            </div>
            {/* Messages */}
            <div className="flex-1 space-y-1.5 px-3 py-2">
                <div className="my-2 flex items-center justify-center">
                    <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <div className="flex justify-start">
                    <Skeleton className="h-6 w-28 rounded-xl" />
                </div>
                <div className="flex justify-end">
                    <Skeleton className="h-6 w-24 rounded-xl bg-primary/20" />
                </div>
                <div className="flex justify-start">
                    <Skeleton className="h-6 w-32 rounded-xl" />
                </div>
                <div className="flex justify-end">
                    <Skeleton className="h-6 w-20 rounded-xl bg-primary/20" />
                </div>
                <div className="flex justify-start">
                    <Skeleton className="h-6 w-36 rounded-xl" />
                </div>
            </div>
            {/* Input */}
            <div className="flex shrink-0 items-center gap-1.5 border-t border-border/50 px-2 py-1.5">
                <Skeleton className="h-8 flex-1 rounded-md" />
                <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
            </div>
        </>
    );
}

// ─── Blogs ──────────────────────────────────────────────────────────

/** Skeleton for a single blog card (My Blogs grid). */
function BlogCardSkeleton() {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="flex flex-1 flex-col p-5 space-y-3">
                <div className="flex items-center gap-2">
                    <SkeletonLine height="lg" width="full" />
                    <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
                </div>
                <div className="space-y-1.5 flex-1">
                    <SkeletonLine height="sm" width="full" />
                    <SkeletonLine height="sm" width="lg" />
                </div>
                <div className="flex items-center justify-between">
                    <SkeletonLine height="xs" width="sm" />
                    <SkeletonLine height="xs" width="xs" />
                </div>
                <div className="flex justify-end">
                    <Skeleton className="h-8 w-16 rounded-md" />
                </div>
            </div>
        </div>
    );
}

/** Skeleton for the My Blogs page. */
function MyBlogsSkeleton() {
    return (
        <div className="relative mx-auto max-w-6xl px-4 py-12">
            {/* Section heading */}
            <div className="mb-12 space-y-2 text-center">
                <SkeletonLine className="mx-auto" height="lg" width="sm" />
                <SkeletonLine className="mx-auto" height="sm" width="md" />
            </div>
            {/* Write button */}
            <div className="mb-8 flex justify-end">
                <Skeleton className="h-9 w-32 rounded-md" />
            </div>
            {/* Blog card grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                    <BlogCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

/** Skeleton for a single blog post page. */
function SingleBlogSkeleton() {
    return (
        <article className="mx-auto max-w-4xl px-4 py-12 space-y-6">
            {/* Title */}
            <div className="space-y-3">
                <SkeletonLine height="lg" width="full" />
                <SkeletonLine height="lg" width="lg" />
            </div>
            {/* Meta */}
            <div className="flex items-center gap-3">
                <SkeletonCircle size="sm" />
                <div className="space-y-1">
                    <SkeletonLine height="sm" width="sm" />
                    <SkeletonLine height="xs" width="md" />
                </div>
            </div>
            {/* Cover image */}
            <Skeleton className="aspect-video w-full rounded-xl" />
            {/* Content lines */}
            <div className="space-y-3">
                <SkeletonLine height="sm" width="full" />
                <SkeletonLine height="sm" width="full" />
                <SkeletonLine height="sm" width="lg" />
                <SkeletonLine height="sm" width="full" />
                <SkeletonLine height="sm" width="md" />
                <SkeletonLine height="sm" width="full" />
                <SkeletonLine height="sm" width="full" />
                <SkeletonLine height="sm" width="lg" />
            </div>
            {/* Comments section */}
            <Skeleton className="h-px w-full" />
            <div className="space-y-4">
                <SkeletonLine height="lg" width="sm" />
                {Array.from({ length: 3 }, (_, i) => (
                    <div className="flex gap-3" key={i}>
                        <SkeletonCircle size="sm" />
                        <div className="flex-1 space-y-1.5">
                            <SkeletonLine height="sm" width="sm" />
                            <SkeletonLine height="sm" width="full" />
                            <SkeletonLine height="sm" width="md" />
                        </div>
                    </div>
                ))}
            </div>
        </article>
    );
}

/** Skeleton for the blog editor page (new/edit). */
function BlogEditorSkeleton() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-12 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-md" />
                <SkeletonLine height="lg" width="sm" />
            </div>
            {/* Title input */}
            <div className="space-y-1.5">
                <SkeletonLine height="sm" width="xs" />
                <Skeleton className="h-10 w-full rounded-md" />
            </div>
            {/* Excerpt input */}
            <div className="space-y-1.5">
                <SkeletonLine height="sm" width="md" />
                <Skeleton className="h-10 w-full rounded-md" />
            </div>
            {/* Cover image */}
            <div className="space-y-1.5">
                <SkeletonLine height="sm" width="lg" />
                <Skeleton className="h-10 w-full rounded-md" />
            </div>
            {/* Content editor */}
            <div className="space-y-1.5">
                <SkeletonLine height="sm" width="xs" />
                <Skeleton className="h-64 w-full rounded-md" />
            </div>
            {/* Tags/Categories */}
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <SkeletonLine height="sm" width="xs" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-1.5">
                    <SkeletonLine height="sm" width="sm" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border pt-6">
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-9 w-28 rounded-md" />
            </div>
        </div>
    );
}

// ─── Settings ───────────────────────────────────────────────────────

/** Skeleton for the Settings page. */
function SettingsSkeleton() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <SkeletonLine height="lg" width="sm" />
                <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            {/* Email verification banner */}
            <Skeleton className="h-20 w-full rounded-xl" />
            {/* Profile form card */}
            <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8 space-y-5">
                <SkeletonLine height="lg" width="lg" />
                {/* Email */}
                <div className="space-y-1.5">
                    <SkeletonLine height="sm" width="xs" />
                    <Skeleton className="h-9 w-full rounded-md" />
                    <SkeletonLine height="xs" width="lg" />
                </div>
                {/* Name */}
                <div className="space-y-1.5">
                    <SkeletonLine height="sm" width="sm" />
                    <Skeleton className="h-9 w-full rounded-md" />
                </div>
                {/* Bio */}
                <div className="space-y-1.5">
                    <SkeletonLine height="sm" width="xs" />
                    <Skeleton className="h-25 w-full rounded-md" />
                </div>
                {/* Profile image */}
                <div className="space-y-1.5">
                    <SkeletonLine height="sm" width="sm" />
                    <Skeleton className="h-9 w-full rounded-md" />
                    <SkeletonCircle size="xl" />
                </div>
                {/* Save button */}
                <Skeleton className="h-9 w-32 rounded-md" />
            </div>
        </div>
    );
}

export {
    BlogCardSkeleton,
    BlogEditorSkeleton,
    BubbleChatPanelSkeleton,
    ChatAreaSkeleton,
    ConversationItemSkeleton,
    ConversationListSkeleton,
    MessagesPageSkeleton,
    MyBlogsSkeleton,
    SettingsSkeleton,
    SingleBlogSkeleton,
};
