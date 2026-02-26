'use client';

import { MessageCircle, Minus, Send, X } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Chronos, formatDate } from 'nhb-toolbox';
import { useCallback, useEffect, useRef, useState } from 'react';
import UserAvatar from '@/components/misc/user-avatar';
import { BubbleChatPanelSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import type { BubbleEdge } from '@/lib/store/chat-bubble-store';
import { useChatBubbleStore } from '@/lib/store/chat-bubble-store';
import { useUserStore } from '@/lib/store/user-store';
import { cn, groupMessagesByDate } from '@/lib/utils';
import type { Conversation, Message } from '@/types/messages';

/** Edge position CSS map. Avoids bottom-right (clock + theme toggler). */
const EDGE_POSITIONS: Record<BubbleEdge, string> = {
    'bottom-left': 'bottom-19 left-6',
    'top-left': 'top-20 left-6',
    'top-right': 'top-20 right-6',
    'left-center': 'top-1/2 left-6 -translate-y-1/2',
    'right-center': 'top-1/2 right-6 -translate-y-1/2',
};

/** Panel origin based on bubble edge. */
const PANEL_POSITIONS: Record<BubbleEdge, string> = {
    'bottom-left': 'bottom-20 left-0',
    'top-left': 'top-16 left-0',
    'top-right': 'top-16 right-0',
    'left-center': 'top-1/2 left-16 -translate-y-1/2',
    'right-center': 'top-1/2 right-16 -translate-y-1/2',
};

interface DragPosition {
    x: number;
    y: number;
}

interface DragStartRef extends DragPosition {
    startX: number;
    startY: number;
}

/** Get the pixel coordinates (center of bubble) for each edge anchor. */
function getEdgeAnchor(edge: BubbleEdge): { x: number; y: number } {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 24 + 6; // half bubble size + spacing (left-6/right-6 = 1.5rem ≈ 24px)
    switch (edge) {
        case 'bottom-left':
            return { x: pad, y: vh - 100 };
        case 'top-left':
            return { x: pad, y: 104 };
        case 'top-right':
            return { x: vw - pad, y: 104 };
        case 'left-center':
            return { x: pad, y: vh / 2 };
        case 'right-center':
            return { x: vw - pad, y: vh / 2 };
    }
}

/** Find the nearest allowed edge to a given point. */
function findNearestEdge(cx: number, cy: number): BubbleEdge {
    const edges: BubbleEdge[] = [
        'bottom-left',
        'top-left',
        'top-right',
        'left-center',
        'right-center',
    ];
    let best: BubbleEdge = 'bottom-left';
    let bestDist = Number.POSITIVE_INFINITY;
    for (const edge of edges) {
        const a = getEdgeAnchor(edge);
        const d = Math.hypot(cx - a.x, cy - a.y);
        if (d < bestDist) {
            bestDist = d;
            best = edge;
        }
    }
    return best;
}

/** The site-wide floating chat bubble + mini chat panel. */
export default function ChatBubble() {
    const { status } = useSession();

    const {
        isOpen,
        isExpanded,
        conversationId,
        edge,
        closeBubble,
        toggleExpanded,
        setExpanded,
        setEdge,
    } = useChatBubbleStore();

    // Dragging state
    const [isDragging, setIsDragging] = useState(false);
    const [dragPos, setDragPos] = useState<DragPosition | null>(null);
    /** Snap-animation target: bubble transitions from dragPos → snapTarget then clears. */
    const [snapTarget, setSnapTarget] = useState<DragPosition | null>(null);
    const dragStartRef = useRef<DragStartRef | null>(null);
    const bubbleRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        // if (isExpanded) return; // Don't drag when panel is open
        const rect = bubbleRef.current?.getBoundingClientRect();
        if (!rect) return;
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            startX: rect.left + rect.width / 2,
            startY: rect.top + rect.height / 2,
        };
        setDragPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, []);

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!isDragging || !dragStartRef.current) return;
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            setDragPos({
                x: dragStartRef.current.startX + dx,
                y: dragStartRef.current.startY + dy,
            });
        },
        [isDragging]
    );

    const handlePointerUp = useCallback(
        (e: React.PointerEvent) => {
            if (!isDragging || !dragPos) {
                setIsDragging(false);
                return;
            }

            // Determine if it was a click (minimal movement) or a drag
            const start = dragStartRef.current;
            const dist = start ? Math.hypot(e.clientX - start.x, e.clientY - start.y) : 0;

            if (dist < 5) {
                // It was a click, toggle expanded
                setIsDragging(false);
                setDragPos(null);
                dragStartRef.current = null;
                toggleExpanded();
                return;
            }

            // Snap to nearest allowed edge
            const newEdge = findNearestEdge(dragPos.x, dragPos.y);
            const target = getEdgeAnchor(newEdge);

            // Start snap animation: keep inline position, animate to target
            setIsDragging(false);
            setSnapTarget(target);
            dragStartRef.current = null;

            // After the transition ends, commit the edge and clear inline styles
            setTimeout(() => {
                setEdge(newEdge);
                setDragPos(null);
                setSnapTarget(null);
            }, 300);
        },
        [isDragging, dragPos, setEdge, toggleExpanded]
    );

    // Compute inline style: dragging freely → snapping to target → static (Tailwind class)
    const isAnimating = !isDragging && snapTarget && dragPos;
    const inlineStyle: React.CSSProperties | undefined =
        isDragging && dragPos
            ? {
                  position: 'fixed',
                  left: dragPos.x - 24,
                  top: dragPos.y - 24,
                  zIndex: 9999,
                  transition: 'none',
              }
            : isAnimating
              ? {
                    position: 'fixed',
                    left: snapTarget.x - 24,
                    top: snapTarget.y - 24,
                    zIndex: 9999,
                    transition:
                        'left 0.3s cubic-bezier(.4,0,.2,1), top 0.3s cubic-bezier(.4,0,.2,1)',
                }
              : undefined;

    // Don't render if not authenticated or not enabled or not open
    if (status !== 'authenticated' || !isOpen) return null;

    return (
        <div
            className={cn('fixed z-50', !isDragging && !isAnimating && EDGE_POSITIONS[edge])}
            ref={bubbleRef}
            style={inlineStyle}
        >
            {/* Fab button */}
            <button
                className={cn(
                    'flex size-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105',
                    'bg-primary text-primary-foreground cursor-pointer',
                    isDragging && 'scale-110 opacity-80 cursor-grabbing'
                    // !isDragging && 'cursor-grab'
                )}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                type="button"
            >
                <MessageCircle className="size-6" />
            </button>

            {/* Mini chat panel */}
            {isExpanded && conversationId && (
                <div
                    className={cn(
                        'absolute w-80 h-112 flex flex-col rounded-xl border border-border bg-card shadow-2xl overflow-hidden',
                        PANEL_POSITIONS[edge]
                    )}
                >
                    <BubbleChatPanel
                        conversationId={conversationId}
                        onClose={closeBubble}
                        onMinimize={() => setExpanded(false)}
                    />
                </div>
            )}
        </div>
    );
}

/** The mini chat panel rendered inside the bubble. */
function BubbleChatPanel({
    conversationId,
    onClose,
    onMinimize,
}: {
    conversationId: number;
    onClose: () => void;
    onMinimize: () => void;
}) {
    const [newMessage, setNewMessage] = useState('');
    const { profile } = useUserStore();
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const prevMsgCountRef = useRef(0);

    // Fetch the conversation list to find the partner
    const { data: conversations = [], isLoading: convsLoading } = useApiQuery<Conversation[]>(
        '/api/messages/conversations',
        {
            queryKey: ['conversations'],
        }
    );

    const activeConv = conversations.find((c) => c.id === conversationId);

    const { data: messages = [], isLoading: msgsLoading } = useApiQuery<Message[]>(
        `/api/messages/conversations/${conversationId}`,
        {
            enabled: !!conversationId,
            refetchInterval: 10000,
            queryKey: ['messages', conversationId],
        }
    );

    const { mutate: sendMsg, isPending: sending } = useApiMutation<null, { content: string }>(
        `/api/messages/conversations/${conversationId}`,
        'POST',
        {
            invalidateKeys: ['messages', 'conversations'],
            onSuccess: () => setNewMessage(''),
            silentSuccessMessage: true,
        }
    );

    const handleSend = () => {
        if (!newMessage.trim() || sending) return;
        sendMsg({ content: newMessage });
        inputRef?.current?.focus();
    };

    const scrollToBottom = useCallback((instant = false) => {
        const el = scrollRef.current;
        if (el) {
            el.scrollTo({ top: el.scrollHeight, behavior: instant ? 'instant' : 'smooth' });
            inputRef?.current?.focus();
        }
    }, []);

    useEffect(() => {
        const hasNew = messages.length > prevMsgCountRef.current;
        if (messages.length > 0 && (prevMsgCountRef.current === 0 || hasNew)) {
            requestAnimationFrame(() => scrollToBottom(prevMsgCountRef.current === 0));
        }
        prevMsgCountRef.current = messages.length;
    }, [messages.length, scrollToBottom]);

    const grouped = groupMessagesByDate(messages);

    if (convsLoading || (msgsLoading && messages.length === 0)) {
        return <BubbleChatPanelSkeleton />;
    }

    return (
        <>
            {/* Header */}
            <div className="flex shrink-0 items-center gap-2 border-b border-border/50 px-3 py-2">
                <UserAvatar
                    className="size-7"
                    image={activeConv?.otherUser.profile_image}
                    name={activeConv?.otherUser.name}
                />
                <Link
                    className="min-w-0 flex-1 truncate text-sm font-semibold hover:underline active:text-primary"
                    href={`/messages/?chat=${activeConv?.id as number}` as Route}
                >
                    {activeConv?.otherUser.name ?? 'Chat'}
                </Link>
                <button
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={onMinimize}
                    title="Minimize"
                    type="button"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <button
                    className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={onClose}
                    title="Close"
                    type="button"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scroll px-3 py-2" ref={scrollRef}>
                {messages.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                        No messages yet.
                    </p>
                ) : (
                    grouped.map(({ date, msgs }) => (
                        <div key={date}>
                            <div className="my-2 flex items-center justify-center">
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    {date}
                                </span>
                            </div>
                            <div className="space-y-0.5">
                                {msgs.map((msg, idx) => {
                                    const isOwn = msg.sender_id === profile?.id;
                                    const prevMsg = idx > 0 ? msgs[idx - 1] : null;
                                    const nextMsg =
                                        idx < msgs.length - 1 ? msgs[idx + 1] : null;
                                    const isFirst = prevMsg?.sender_id !== msg.sender_id;
                                    const isLast = nextMsg?.sender_id !== msg.sender_id;

                                    const isSameMin = nextMsg?.created_at
                                        ? new Chronos(msg.created_at).isSame(
                                              nextMsg.created_at,
                                              'minute'
                                          )
                                        : false;

                                    return (
                                        <div
                                            className={cn(
                                                'flex',
                                                isOwn ? 'justify-end' : 'justify-start'
                                            )}
                                            key={msg.id}
                                        >
                                            <div
                                                className={cn(
                                                    'max-w-[80%] px-2.5 py-1 text-xs',
                                                    isOwn
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted',
                                                    isOwn
                                                        ? cn(
                                                              'rounded-l-xl',
                                                              isFirst &&
                                                                  'rounded-tr-xl rounded-br-md',
                                                              !isFirst &&
                                                                  !isLast &&
                                                                  'rounded-r-md',
                                                              isLast &&
                                                                  !isFirst &&
                                                                  'rounded-br-xl rounded-tr-md',
                                                              isFirst && isLast && 'rounded-xl'
                                                          )
                                                        : cn(
                                                              'rounded-r-xl',
                                                              isFirst &&
                                                                  'rounded-tl-xl rounded-bl-md',
                                                              !isFirst &&
                                                                  !isLast &&
                                                                  'rounded-l-md',
                                                              isLast &&
                                                                  !isFirst &&
                                                                  'rounded-bl-xl rounded-tl-md',
                                                              isFirst && isLast && 'rounded-xl'
                                                          )
                                                )}
                                            >
                                                <p className="whitespace-pre-wrap wrap-break-word">
                                                    {msg.content}
                                                </p>
                                                {isSameMin || (
                                                    <p
                                                        className={cn(
                                                            'mt-0.5 text-[9px]',
                                                            isOwn
                                                                ? 'text-right opacity-60'
                                                                : 'text-muted-foreground/70'
                                                        )}
                                                    >
                                                        {formatDate({
                                                            date: msg.created_at,
                                                            format: 'hh:mm a',
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <div className="flex shrink-0 items-center gap-1.5 border-t border-border/50 px-2 py-1.5">
                <Input
                    className="h-8 flex-1 text-xs"
                    disabled={sending}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="Message..."
                    ref={inputRef}
                    value={newMessage}
                />
                <Button
                    className="h-8 w-8 shrink-0"
                    disabled={!newMessage.trim() || sending}
                    onClick={handleSend}
                    size="icon"
                >
                    <Send className="h-3.5 w-3.5" />
                </Button>
            </div>
        </>
    );
}
