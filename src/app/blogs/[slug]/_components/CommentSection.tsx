'use client';

import { Reply as ReplyIcon, Send, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRef, useState } from 'react';
import { FadeInUp } from '@/components/misc/animations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { httpRequest } from '@/lib/actions/baseRequest';
import { buildCloudinaryUrl } from '@/lib/utils';
import type { BlogComment } from '@/types/blogs';

interface CommentSectionProps {
    blogId: number;
    comments: BlogComment[];
}

interface CommentItemProps {
    comment: BlogComment;
    depth?: number;
}

/**
 * Comment section for blog posts with threaded replies.
 */
export function CommentSection({ blogId, comments }: CommentSectionProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [content, setContent] = useState('');
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    const topLevelComments = comments.filter((c) => !c.parent_comment_id);

    const getReplies = (parentId: number): BlogComment[] =>
        comments.filter((c) => c.parent_comment_id === parentId);

    const handleSubmit = async () => {
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            await httpRequest('/api/comments', {
                method: 'POST',
                body: {
                    content,
                    blog_id: blogId,
                    ...(replyTo && { parent_comment_id: replyTo }),
                },
            });
            setContent('');
            setReplyTo(null);
            router.refresh();
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const CommentItem = ({ comment, depth = 0 }: CommentItemProps) => {
        const replies = getReplies(comment.id);

        return (
            <div className={`${depth > 0 ? 'ml-8 border-l-2 border-border pl-4' : ''}`}>
                <div className="flex gap-3 py-3">
                    <Link className="shrink-0" href={`/users/${comment.author.id}`}>
                        {comment.author.profile_image ? (
                            <Image
                                alt={comment.author.name}
                                className="h-8 w-8 rounded-full object-cover"
                                height={32}
                                src={buildCloudinaryUrl(comment.author.profile_image)}
                                width={32}
                            />
                        ) : (
                            <User className="h-8 w-8 rounded-full bg-muted p-1.5" />
                        )}
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Link
                                className="text-sm font-medium hover:underline"
                                href={`/users/${comment.author.id}`}
                            >
                                {comment.author.name}
                            </Link>
                            <span className="text-xs text-muted-foreground">
                                {new Date(comment.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{comment.content}</p>
                        {session?.user && (
                            <button
                                className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    setReplyTo(comment.id);
                                    textAreaRef?.current?.focus();
                                }}
                                type="button"
                            >
                                <ReplyIcon className="h-3 w-3" />
                                Reply
                            </button>
                        )}
                    </div>
                </div>
                {replies.map((reply) => (
                    <CommentItem comment={reply} depth={depth + 1} key={reply.id} />
                ))}
            </div>
        );
    };

    return (
        <FadeInUp delay={0.4}>
            <section className="mt-12 border-t border-border pt-8">
                <h2 className="mb-6 text-xl font-bold">Comments ({comments.length})</h2>

                {session?.user ? (
                    <div className="mb-8">
                        {replyTo && (
                            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Replying to comment</span>
                                <button
                                    className="text-primary hover:underline"
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

                <div className="space-y-1">
                    {topLevelComments.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No comments yet. Be the first to share your thoughts!
                        </p>
                    ) : (
                        topLevelComments.map((comment) => (
                            <CommentItem comment={comment} key={comment.id} />
                        ))
                    )}
                </div>
            </section>
        </FadeInUp>
    );
}
