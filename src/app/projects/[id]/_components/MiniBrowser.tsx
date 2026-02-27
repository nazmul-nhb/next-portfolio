'use client';

import { ExternalLink, Globe, RefreshCw, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import SmartTooltip from '@/components/smart-tooltip';
import { Button } from '@/components/ui/button';
import { buildCloudinaryUrl, cn } from '@/lib/utils';

interface MiniBrowserProps {
    favicon?: string;
    url: string;
    title: string;
    onClose: () => void;
}

/** Chrome-like mini browser dialog for previewing live project URLs. */
export default function MiniBrowser({ url, favicon, title, onClose }: MiniBrowserProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleRefresh = useCallback(() => {
        if (iframeRef.current) {
            setIsLoading(true);
            iframeRef.current.src = url;
        }
    }, [url]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
                {/* Chrome-like title bar */}
                <div className="flex shrink-0 items-center gap-2 border-b border-border bg-muted/80 px-3 py-2 select-none">
                    {/* Traffic lights */}
                    <div className="flex items-center gap-1.5">
                        <button
                            className="size-3 rounded-full bg-red-500 transition-opacity hover:opacity-80"
                            onClick={onClose}
                            type="button"
                        />
                        <div className="size-3 rounded-full bg-yellow-500" />
                        <div className="size-3 rounded-full bg-green-500" />
                    </div>

                    {/* Address bar */}
                    <div className="mx-2 flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-1.5">
                        {<Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}{' '}
                        <span className="truncate text-xs text-muted-foreground">{url}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <Button onClick={handleRefresh} size="icon-sm" variant="ghost">
                            <SmartTooltip
                                content="Refresh"
                                trigger={
                                    <RefreshCw
                                        className={cn('size-3.5', isLoading && 'animate-spin')}
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

                {/* Iframe content */}
                <iframe
                    className="flex-1 bg-white"
                    onLoad={() => setIsLoading(false)}
                    ref={iframeRef}
                    src={url}
                    title={title || 'Live Preview'}
                />
            </div>
        </div>
    );
}
