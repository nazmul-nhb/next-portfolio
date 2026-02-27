'use client';

import { CornerDownRight, Reply as ReplyIcon, Send } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { formatDate } from 'nhb-toolbox';
import { useMemo, useRef, useState } from 'react';
import { FadeInUp } from '@/components/misc/animations';
import UserAvatar from '@/components/misc/user-avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApiMutation } from '@/lib/hooks/use-api';
import { cn } from '@/lib/utils';
import type { BlogComment } from '@/types/blogs';

interface CommentSectionProps {
    blogId: number;
    blogSlug: string;
    comments: BlogComment[];
}

/** Builds a flat, ordered list of comments grouped under their root thread. */
function buildFlatThread(comments: BlogComment[]) {
    const byId = new Map<number, BlogComment>();
    const childrenMap = new Map<number, BlogComment[]>();

    for (const c of comments) {
        byId.set(c.id, c);
        if (!childrenMap.has(c.id)) childrenMap.set(c.id, []);

        if (c.parent_comment_id) {
            const siblings = childrenMap.get(c.parent_comment_id) ?? [];
            siblings.push(c);
            childrenMap.set(c.parent_comment_id, siblings);
        }
    }

    const topLevel = comments.filter((c) => !c.parent_comment_id);

    /** Collect all descendants of a comment in depth-first order. */
    function collectReplies(parentId: number): BlogComment[] {
        const children = childrenMap.get(parentId) ?? [];
        const result: BlogComment[] = [];
        for (const child of children) {
            result.push(child);
            result.push(...collectReplies(child.id));
        }
        return result;
    }

    return topLevel.map((root) => ({
        root,
        replies: collectReplies(root.id),
    }));
}

/**
 * Comment section for blog posts with flat-threaded replies.
 * Top-level comments are displayed normally. All replies (regardless of depth)
 * are shown flat with a "replying to @name" indicator for nested replies.
 */
export function CommentSection({ blogId, blogSlug, comments }: CommentSectionProps) {
    const { data: session } = useSession();
    const [content, setContent] = useState('');
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    const byId = useMemo(() => {
        const map = new Map<number, BlogComment>();
        for (const c of comments) map.set(c.id, c);
        return map;
    }, [comments]);

    const threads = useMemo(() => buildFlatThread(comments), [comments]);

    /** Get the author name of the direct parent comment. */
    const getParentAuthor = (comment: BlogComment): string | null => {
        if (!comment.parent_comment_id) return null;
        return byId.get(comment.parent_comment_id)?.author.name ?? null;
    };

    const replyToComment = replyTo ? byId.get(replyTo) : null;

    const { mutate: postComment, isPending: submitting } = useApiMutation<
        unknown,
        { content: string; blog_id: number; parent_comment_id?: number }
    >('/api/comments', 'POST', {
        invalidateKeys: ['blog', blogSlug],
        silentSuccessMessage: true,
        onSuccess: () => {
            setContent('');
            setReplyTo(null);
        },
        onError: (error) => console.error('Failed to post comment:', error),
    });

    const handleSubmit = () => {
        if (!content.trim()) return;
        postComment({
            content,
            blog_id: blogId,
            ...(replyTo && { parent_comment_id: replyTo }),
        });
    };

    const handleReply = (commentId: number) => {
        setReplyTo(commentId);
        textAreaRef?.current?.focus();
    };

    return (
        <FadeInUp delay={0.4}>
            <section className="mt-12 border-t border-border pt-8">
                <h2 className="mb-6 text-xl font-bold">Comments ({comments.length})</h2>

                {session?.user ? (
                    <div className="mb-8">
                        {replyToComment && (
                            <div className="mb-2 flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 text-sm">
                                <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Replying to{' '}
                                    <span className="font-medium text-foreground">
                                        {replyToComment.author.name}
                                    </span>
                                </span>
                                <button
                                    className="ml-auto text-xs text-primary hover:underline"
                                    onClick={() => setReplyTo(null)}
                                    type="button"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <Textarea
                                className="min-h-20 flex-1 resize-none"
                                disabled={submitting}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write a comment..."
                                ref={textAreaRef}
                                value={content}
                            />
                            <Button
                                className="shrink-0 self-end"
                                disabled={!content.trim() || submitting}
                                onClick={handleSubmit}
                                size="sm"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="mb-8 rounded-lg border border-border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                        <Link className="text-primary hover:underline" href="/auth/login">
                            Sign in
                        </Link>{' '}
                        to join the conversation.
                    </div>
                )}

                <div className="space-y-6">
                    {threads.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No comments yet. Be the first to share your thoughts!
                        </p>
                    ) : (
                        threads.map(({ root, replies }) => (
                            <div key={root.id}>
                                {/* Top-level comment */}
                                <CommentItem
                                    comment={root}
                                    isReplyTarget={replyTo === root.id}
                                    onReply={session?.user ? handleReply : undefined}
                                />

                                {/* Flat replies with a left border thread line */}
                                {replies.length > 0 && (
                                    <div className="ml-5 border-l-2 border-border/60 pl-5 sm:ml-8 sm:pl-6">
                                        {replies.map((reply) => {
                                            const parentAuthor = getParentAuthor(reply);
                                            const isNestedReply =
                                                reply.parent_comment_id !== root.id;

                                            return (
                                                <CommentItem
                                                    comment={reply}
                                                    isReplyTarget={replyTo === reply.id}
                                                    key={reply.id}
                                                    onReply={
                                                        session?.user ? handleReply : undefined
                                                    }
                                                    replyingTo={
                                                        isNestedReply
                                                            ? (parentAuthor ?? undefined)
                                                            : undefined
                                                    }
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </section>
        </FadeInUp>
    );
}

/** A single comment item — used for both top-level and reply comments. */
function CommentItem({
    comment,
    onReply,
    replyingTo,
    isReplyTarget,
}: {
    comment: BlogComment;
    onReply?: (id: number) => void;
    replyingTo?: string;
    isReplyTarget?: boolean;
}) {
    return (
        <div
            className={cn(
                'flex gap-3 py-3',
                isReplyTarget && 'rounded-md bg-primary/5 -mx-2 px-2'
            )}
        >
            <Link className="shrink-0" href={`/users/${comment.author.id}`}>
                <UserAvatar
                    className="size-8 hover:scale-105 transition-transform"
                    image={comment.author.profile_image}
                    name={comment.author.name}
                />
            </Link>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <Link
                        className="text-sm font-medium hover:underline"
                        href={`/users/${comment.author.id}`}
                    >
                        {comment.author.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                        {formatDate({
                            date: comment.created_at,
                            format: 'mmm DD, yyyy [at] hh:mm a',
                        })}
                    </span>
                </div>

                {replyingTo && (
                    <span className="mb-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <CornerDownRight className="size-3" />
                        <span className="font-medium text-primary/80">@{replyingTo}</span>
                    </span>
                )}

                <p className="mt-1 text-sm text-muted-foreground">{comment.content}</p>

                {onReply && (
                    <button
                        className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => onReply(comment.id)}
                        type="button"
                    >
                        <ReplyIcon className="size-3" />
                        Reply
                    </button>
                )}
            </div>
        </div>
    );
}
