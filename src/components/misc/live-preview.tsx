'use client';

import { ExternalLink, Play } from 'lucide-react';
import { useMediaQuery } from 'nhb-hooks';
import { useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import MiniBrowser from '@/components/misc/mini-browser';
import { Button } from '@/components/ui/button';

interface LivePreviewButtonProps {
    url: string;
    title: string;
    favicon?: string;
    newTabLabel?: string;
    previewLabel?: string;
}

/** Button that opens a mini browser to preview the live project. */
export default function LivePreviewButton({
    url,
    title,
    favicon,
    newTabLabel,
    previewLabel = 'Preview',
}: LivePreviewButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 400 });

    return (
        <Fragment>
            <Button className="gap-1 sm:gap-2" onClick={() => setIsOpen(true)} size="sm">
                <Play className="size-4" /> {previewLabel}
            </Button>
            <a href={url} rel="noopener noreferrer" target="_blank">
                <Button className="gap-1 sm:gap-2" size="sm" variant="outline">
                    <ExternalLink className="size-4" />
                    {(newTabLabel ?? isMobile) ? 'Open in Tab' : 'Open in New Tab'}
                </Button>
            </a>

            {isOpen && (
                <MiniBrowser
                    favicon={favicon}
                    onClose={() => setIsOpen(false)}
                    title={title}
                    url={url}
                />
            )}
        </Fragment>
    );
}
