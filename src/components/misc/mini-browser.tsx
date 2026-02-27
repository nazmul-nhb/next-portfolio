'use client';

import { DndContext, type DragEndEvent, useDraggable } from '@dnd-kit/core';
import { ExternalLink, Globe, X } from 'lucide-react';
import Image from 'next/image';
import { useWindowResize } from 'nhb-hooks';
import {
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { Fragment } from 'react/jsx-runtime';
import { MdOutlineRefresh } from 'react-icons/md';
import SmartTooltip from '@/components/smart-tooltip';
import { Button } from '@/components/ui/button';
import { buildCloudinaryUrl, cn } from '@/lib/utils';

const MIN_W = 320;
const MIN_H = 300;

/** Scrollbar CSS injected into same-origin iframes. */
const SCROLLBAR_CSS = /*css*/ `
html{--sb-track:#8da7ff40;--sb-thumb:#9eb4fbbd;--sb-size:6px}
html::-webkit-scrollbar{width:var(--sb-size)}
html::-webkit-scrollbar-track{background:var(--sb-track)}
html::-webkit-scrollbar-thumb{background:var(--sb-thumb);border-radius:2px;border:0.5px solid #9eb4fb}
@supports not selector(::-webkit-scrollbar){html{scrollbar-color:var(--sb-thumb) var(--sb-track)}}
`;

/** Build the proxied URL so the iframe is same-origin and we can inject CSS. */
function proxyUrl(url: string) {
    return `/api/proxy?url=${encodeURIComponent(url)}`;
}

/** Calculate browser window dimensions from viewport size. */
function calcSize(vw: number, vh: number) {
    return {
        width: vw < 640 ? Math.round(vw * 0.96) : Math.round(vw * 0.72),
        height: vw < 640 ? Math.round(vh * 0.86) : Math.round(vh * 0.9),
    };
}

interface MiniBrowserProps {
    favicon?: string;
    url: string;
    title: string;
    onClose: () => void;
}

/**
 * Chrome-like mini browser dialog for previewing live project URLs.
 * Draggable via title bar (@dnd-kit) and resizable via edge handles.
 */
export default function MiniBrowser(props: MiniBrowserProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        setPosition((prev) => ({
            x: prev.x + event.delta.x,
            y: prev.y + event.delta.y,
        }));
    }, []);

    return (
        <DndContext autoScroll={false} onDragEnd={handleDragEnd}>
            <BrowserWindow {...props} position={position} />
        </DndContext>
    );
}

/* ------------------------------------------------------------------ */

interface BrowserWindowProps extends MiniBrowserProps {
    position: { x: number; y: number };
}

function BrowserWindow({ url, favicon, title, onClose, position }: BrowserWindowProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const sizeRef = useRef({ width: 0, height: 0 });
    /** Tracks whether user has manually resized via edge handles. */
    const userResizedRef = useRef(false);

    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [size, setSize] = useState({ width: 0, height: 0 });

    sizeRef.current = size;

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: 'mini-browser-window',
        disabled: isFullscreen,
    });

    /* ---------- Body scroll lock + Escape to close ---------- */
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);

        return () => {
            document.body.style.overflow = prev;
            document.removeEventListener('keydown', handleKey);
        };
    }, [onClose]);

    /* ---------- Initialise size from viewport ---------- */
    useEffect(() => {
        setSize(calcSize(window.innerWidth, window.innerHeight));
    }, []);

    /* ---------- Respond to main browser window resize ---------- */
    useWindowResize(() => {
        if (userResizedRef.current) return;
        setSize(calcSize(window.innerWidth, window.innerHeight));
    });

    /* ---------- Inject custom scrollbar CSS into same-origin iframes ---------- */
    const handleIframeLoad = useCallback(() => {
        setIsLoading(false);
        try {
            const doc = iframeRef.current?.contentDocument;
            if (doc) {
                // Proxied pages already have injected CSS, but this is a
                // safety net for any same-origin pages loaded directly.
                if (!doc.querySelector('style[data-mini-browser]')) {
                    const style = doc.createElement('style');
                    style.setAttribute('data-mini-browser', '');
                    style.textContent = SCROLLBAR_CSS;
                    doc.head.appendChild(style);
                }
            }
        } catch (error) {
            console.error('Failed to inject scrollbar CSS into iframe:', error);
        }
    }, []);

    /* ---------- Refresh ---------- */
    const handleRefresh = useCallback(() => {
        if (iframeRef.current) {
            setIsLoading(true);
            iframeRef.current.src = proxyUrl(url);
        }
    }, [url]);

    /* ---------- Edge / corner resize ---------- */
    const handleResize = useCallback((dir: 'e' | 's' | 'se', e: ReactPointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        userResizedRef.current = true;

        const startX = e.clientX;
        const startY = e.clientY;
        const startW = sizeRef.current.width;
        const startH = sizeRef.current.height;

        const onMove = (ev: PointerEvent) => {
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            setSize({
                width: Math.max(MIN_W, dir !== 's' ? startW + dx : startW),
                height: Math.max(MIN_H, dir !== 'e' ? startH + dy : startH),
            });
        };

        const onUp = () => {
            setIsResizing(false);
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
        };

        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
    }, []);

    /* ---------- Computed styles ---------- */
    const isInteracting = isDragging || isResizing;

    const tx = position.x + (transform?.x ?? 0);
    const ty = position.y + (transform?.y ?? 0);

    const windowStyle: CSSProperties = isFullscreen
        ? { inset: 0, borderRadius: 0 }
        : size.width > 0
          ? {
                width: size.width,
                height: size.height,
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`,
            }
          : { opacity: 0 };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
            <div
                className={cn(
                    'fixed flex flex-col overflow-hidden border border-border bg-background shadow-2xl',
                    !isFullscreen && 'rounded-xl',
                    isDragging && 'ring-2 ring-primary/20'
                )}
                onClick={(e) => e.stopPropagation()}
                ref={setNodeRef}
                style={windowStyle}
            >
                {/* Chrome-like title bar – drag handle */}
                <div
                    className={cn(
                        'flex shrink-0 items-center gap-2 border-b border-border bg-muted/80 px-3 py-2 select-none',
                        !isFullscreen && 'cursor-grab',
                        isDragging && 'cursor-grabbing'
                    )}
                    {...listeners}
                    {...attributes}
                >
                    {/* Traffic lights */}
                    <div
                        className="flex items-center gap-1.5"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <button
                            className="size-3 rounded-full bg-red-500 transition-opacity hover:opacity-80"
                            onClick={onClose}
                            type="button"
                        />
                        <button
                            className="size-3 rounded-full bg-yellow-500"
                            onClick={onClose}
                            type="button"
                        />
                        <button
                            className="size-3 rounded-full bg-green-500"
                            onClick={() => setIsFullscreen((p) => !p)}
                            type="button"
                        />
                    </div>

                    {/* Address bar */}
                    <div className="mx-2 flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-1.5">
                        <Globe className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate text-xs text-muted-foreground">{url}</span>
                    </div>

                    {/* Actions */}
                    <div
                        className="flex items-center gap-1"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <Button onClick={handleRefresh} size="icon-sm" variant="ghost">
                            <SmartTooltip
                                content="Refresh"
                                trigger={
                                    <MdOutlineRefresh
                                        className={cn('size-4', isLoading && 'animate-spin')}
                                    />
                                }
                            />
                        </Button>
                        <a href={url} rel="noopener noreferrer" target="_blank">
                            <Button size="icon-sm" variant="ghost">
                                <SmartTooltip
                                    content="Open in new tab"
                                    trigger={<ExternalLink className="size-3.5" />}
                                />
                            </Button>
                        </a>
                        <Button onClick={onClose} size="icon-sm" variant="ghost">
                            <SmartTooltip
                                content="Close"
                                trigger={<X className="size-3.5" />}
                            />
                        </Button>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex shrink-0 items-center border-b border-border bg-muted/40 px-2">
                    <div className="flex items-center gap-2 rounded-t-md border-x border-t border-border bg-background px-3 py-1.5">
                        {favicon ? (
                            <Image
                                alt={title}
                                className="size-4"
                                height={16}
                                src={buildCloudinaryUrl(favicon)}
                                width={16}
                            />
                        ) : (
                            <Globe className="size-3 text-muted-foreground" />
                        )}
                        <span className="max-w-48 truncate text-xs select-none">
                            {title || url}
                        </span>
                    </div>
                </div>

                {/* Loading indicator */}
                {isLoading && (
                    <div className="h-0.5 w-full overflow-hidden bg-muted">
                        <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
                    </div>
                )}

                {/* Iframe – pointer-events disabled during drag/resize */}
                <iframe
                    className={cn('flex-1 bg-white', isInteracting && 'pointer-events-none')}
                    draggable
                    onLoad={handleIframeLoad}
                    ref={iframeRef}
                    src={proxyUrl(url)}
                    title={title || 'Live Preview'}
                />

                {/* Resize handles (hidden in fullscreen) */}
                {!isFullscreen && (
                    <Fragment>
                        <div
                            className="absolute top-8 right-0 bottom-0 w-1.5"
                            onPointerDown={(e) => handleResize('e', e)}
                            style={{ cursor: 'e-resize' }}
                        />
                        <div
                            className="absolute right-0 bottom-0 left-0 h-1.5"
                            onPointerDown={(e) => handleResize('s', e)}
                            style={{ cursor: 's-resize' }}
                        />
                        <div
                            className="absolute right-0 bottom-0 size-4"
                            onPointerDown={(e) => handleResize('se', e)}
                            style={{ cursor: 'se-resize' }}
                        />
                    </Fragment>
                )}
            </div>
        </div>
    );
}
