'use client';

import { DndContext, type DragEndEvent, useDraggable } from '@dnd-kit/core';
import { AlertTriangle, ExternalLink, Globe, Loader2, X } from 'lucide-react';
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
import { FiGithub } from 'react-icons/fi';
import { MdOutlineRefresh } from 'react-icons/md';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import SmartTooltip from '@/components/misc/smart-tooltip';
import { buildCloudinaryUrl, cn, hasErrorMessage } from '@/lib/utils';

const MIN_W = 320;
const MIN_H = 300;
const IFRAME_BLOCKED_DOMAINS = ['github.com'];
const GITHUB_HOSTS = new Set(['github.com', 'www.github.com']);

/** Scrollbar CSS injected into same-origin iframes. */
const SCROLLBAR_CSS = /*css*/ `
    html{--sb-track:#8da7ff40;--sb-thumb:#9eb4fbbd;--sb-size:6px}
    html::-webkit-scrollbar{width:var(--sb-size)}
    html::-webkit-scrollbar-track{background:var(--sb-track)}
    html::-webkit-scrollbar-thumb{background:var(--sb-thumb);border-radius:2px;border:0.5px solid #9eb4fb}
    @supports not selector(::-webkit-scrollbar){html{scrollbar-color:var(--sb-thumb) var(--sb-track)}}
`;

/** Calculate browser window dimensions from viewport size. */
function calcSize(vw: number, vh: number) {
    return {
        width: vw < 640 ? Math.round(vw * 0.96) : Math.round(vw * 0.8),
        height: vw < 640 ? Math.round(vh * 0.86) : Math.round(vh * 0.9),
    };
}

/** Returns normalized hostname, or null for invalid URLs. */
function getHostname(rawUrl: string) {
    try {
        return new URL(rawUrl).hostname.toLowerCase();
    } catch {
        return null;
    }
}

/** Returns blocked root domain when known to deny iframe embedding. */
function getIframeBlockedDomain(rawUrl: string) {
    const host = getHostname(rawUrl);
    if (!host) return null;

    return (
        IFRAME_BLOCKED_DOMAINS.find(
            (domain) => host === domain || host.endsWith(`.${domain}`)
        ) ?? null
    );
}

interface GitHubRepoRef {
    owner: string;
    repo: string;
}

/** Extracts owner/repo from a GitHub URL. */
function getGitHubRepoFromUrl(rawUrl: string): GitHubRepoRef | null {
    try {
        const parsed = new URL(rawUrl);
        const host = parsed.hostname.toLowerCase();
        if (!GITHUB_HOSTS.has(host)) return null;

        const parts = parsed.pathname.split('/').filter(Boolean);
        if (parts.length < 2) return null;

        const owner = parts[0]?.trim();
        const repo = parts[1]?.replace(/\.git$/i, '').trim();
        if (!owner || !repo) return null;

        return { owner, repo };
    } catch {
        return null;
    }
}

/** Decodes base64 to UTF-8 text in the browser runtime. */
function decodeBase64Utf8(base64: string) {
    const compact = base64.replace(/\s/g, '');
    const binary = atob(compact);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

interface GitHubReadmeApiResponse {
    content?: string;
    encoding?: string;
    html_url?: string;
    name?: string;
}

interface GitHubReadme {
    owner: string;
    repo: string;
    content: string;
    htmlUrl: string;
    name: string;
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
    const githubRepo = getGitHubRepoFromUrl(url);
    const githubOwner = githubRepo?.owner ?? null;
    const githubName = githubRepo?.repo ?? null;
    const isGithubRepo = githubOwner !== null && githubName !== null;

    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [iframeSrc, setIframeSrc] = useState(url);
    const [blockedDomain, setBlockedDomain] = useState<string | null>(null);
    const [githubReadme, setGithubReadme] = useState<GitHubReadme | null>(null);
    const [githubReadmeError, setGithubReadmeError] = useState<string | null>(null);
    const [readmeReloadToken, setReadmeReloadToken] = useState(0);
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
                if (!doc.querySelector('style[data-mini-browser]')) {
                    const style = doc.createElement('style');
                    style.setAttribute('data-mini-browser', '');
                    style.textContent = SCROLLBAR_CSS;
                    doc.head.appendChild(style);
                }
            }
        } catch (error) {
            console.error('Error loading iFrame', error);
        }
    }, []);

    /* ---------- Refresh ---------- */
    const handleRefresh = useCallback(() => {
        if (isGithubRepo) {
            setIsLoading(true);
            setReadmeReloadToken((token) => token + 1);
            return;
        }

        const blocked = getIframeBlockedDomain(url);
        setBlockedDomain(blocked);
        if (blocked) {
            setIsLoading(false);
            return;
        }

        if (iframeRef.current) {
            setIsLoading(true);
            iframeRef.current.src = url;
            return;
        }

        setIsLoading(true);
        setIframeSrc(url);
    }, [isGithubRepo, url]);

    useEffect(() => {
        if (isGithubRepo) {
            setBlockedDomain(null);
            return;
        }

        const blocked = getIframeBlockedDomain(url);
        setBlockedDomain(blocked);
        setGithubReadme(null);
        setGithubReadmeError(null);
        setIsLoading(!blocked);
        setIframeSrc(url);
    }, [isGithubRepo, url]);

    useEffect(() => {
        if (!isGithubRepo || !githubOwner || !githubName) return;
        // Manual refresh uses this token to trigger this effect again.
        void readmeReloadToken;

        const abortController = new AbortController();

        setIsLoading(true);
        setBlockedDomain(null);
        setGithubReadme(null);
        setGithubReadmeError(null);

        const owner = githubOwner;
        const repo = githubName;

        const loadReadme = async () => {
            try {
                const endpoint = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`;
                const response = await fetch(endpoint, {
                    signal: abortController.signal,
                    headers: {
                        Accept: 'application/vnd.github+json',
                    },
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('README not found for this repository.');
                    }
                    throw new Error(`Failed to load README (${response.status}).`);
                }

                const data = (await response.json()) as GitHubReadmeApiResponse;
                if (data.encoding !== 'base64' || typeof data.content !== 'string') {
                    throw new Error('GitHub returned an unsupported README format.');
                }

                if (abortController.signal.aborted) return;

                setGithubReadme({
                    owner,
                    repo,
                    content: decodeBase64Utf8(data.content),
                    htmlUrl: data.html_url ?? url,
                    name: data.name ?? 'README.md',
                });
            } catch (error) {
                if (abortController.signal.aborted) return;

                setGithubReadmeError(
                    hasErrorMessage(error)
                        ? error.message
                        : 'Failed to load README from GitHub.'
                );
            } finally {
                if (!abortController.signal.aborted) setIsLoading(false);
            }
        };

        void loadReadme();

        return () => {
            abortController.abort();
        };
    }, [githubName, githubOwner, isGithubRepo, readmeReloadToken, url]);

    const handleIframeError = useCallback(() => {
        if (isGithubRepo) return;
        setIsLoading(false);
        setBlockedDomain((prev) => prev ?? getHostname(url));
    }, [isGithubRepo, url]);

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
                        <button
                            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            onClick={handleRefresh}
                            type="button"
                        >
                            <SmartTooltip
                                content="Refresh"
                                trigger={
                                    isLoading ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <MdOutlineRefresh className="size-4" />
                                    )
                                }
                            />
                        </button>
                        <a
                            className="rounded-md p-1 mb-0.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            href={url}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <SmartTooltip
                                content="Open in new tab"
                                trigger={<ExternalLink className="size-3.5" />}
                            />
                        </a>
                        <button
                            className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={onClose}
                            type="button"
                        >
                            <SmartTooltip content="Close" trigger={<X className="size-4" />} />
                        </button>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex shrink-0 items-center border-b border-border bg-muted/40 px-2">
                    <div className="flex items-center gap-2 rounded-t-md border-x border-t border-border bg-background px-3 py-1.5">
                        {isLoading ? (
                            <Loader2 className="size-3 animate-spin" />
                        ) : favicon ? (
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
                        <button
                            className="rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={onClose}
                            type="button"
                        >
                            <SmartTooltip content="Close" trigger={<X className="size-3" />} />
                        </button>
                    </div>
                </div>

                {/* Loading indicator */}
                {isLoading && (
                    <div className="h-0.5 w-full overflow-hidden bg-muted">
                        <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
                    </div>
                )}

                {/* Iframe – pointer-events disabled during drag/resize */}
                {githubRepo ? (
                    <div className="flex min-h-0 flex-1 flex-col bg-muted/20">
                        <div className="flex items-center justify-between border-b border-border/70 bg-background px-4 py-2">
                            <SmartTooltip
                                content={
                                    githubReadme
                                        ? `${githubReadme.owner}/${githubReadme.repo}`
                                        : `${githubRepo.owner}/${githubRepo.repo}`
                                }
                                side="right"
                                trigger={
                                    <p className="flex items-center gap-1 select-none text-xs text-muted-foreground">
                                        <FiGithub />
                                        {githubReadme ? githubReadme.name : 'README'}
                                    </p>
                                }
                            />
                            <a
                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                href={githubReadme?.htmlUrl ?? url}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <ExternalLink className="size-3" />
                                Open on GitHub
                            </a>
                        </div>

                        <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
                            {githubReadmeError ? (
                                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                                    <AlertTriangle className="size-5 text-amber-500" />
                                    <p className="max-w-md text-sm text-muted-foreground">
                                        {githubReadmeError}
                                    </p>
                                </div>
                            ) : githubReadme ? (
                                <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none prose-a:text-primary prose-pre:border prose-pre:border-border prose-pre:bg-muted">
                                    <Markdown
                                        components={{
                                            a: ({ children, href }) => (
                                                <a
                                                    href={href}
                                                    rel="noopener noreferrer"
                                                    target="_blank"
                                                >
                                                    {children}
                                                </a>
                                            ),
                                        }}
                                        disallowedElements={['img']}
                                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                        remarkPlugins={[remarkGfm]}
                                        unwrapDisallowed
                                    >
                                        {githubReadme.content}
                                    </Markdown>
                                </div>
                            ) : (
                                <div className="h-full" />
                            )}
                        </div>
                    </div>
                ) : blockedDomain ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-muted/20 p-6 text-center">
                        <AlertTriangle className="size-5 text-amber-500" />
                        <p className="max-w-md text-sm text-muted-foreground">
                            {blockedDomain} blocks iframe embedding via Content Security Policy
                            or X-Frame-Options.
                        </p>
                        <a
                            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent"
                            href={url}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <ExternalLink className="size-3.5" />
                            Open in new tab
                        </a>
                    </div>
                ) : (
                    <iframe
                        className={cn(
                            'flex-1 bg-white',
                            isInteracting && 'pointer-events-none'
                        )}
                        draggable
                        onError={handleIframeError}
                        onLoad={handleIframeLoad}
                        ref={iframeRef}
                        src={iframeSrc}
                        title={title || 'Live Preview'}
                    />
                )}

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
