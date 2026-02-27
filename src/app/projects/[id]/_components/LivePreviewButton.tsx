'use client';

import { ExternalLink, Play } from 'lucide-react';
import { useState } from 'react';
import MiniBrowser from '@/app/projects/[id]/_components/MiniBrowser';
import { Button } from '@/components/ui/button';

interface LivePreviewButtonProps {
    url: string;
    title: string;
    favicon?: string;
}

/** Button that opens a mini browser to preview the live project. */
export default function LivePreviewButton({ url, title, favicon }: LivePreviewButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button className="gap-2" onClick={() => setIsOpen(true)}>
                <Play className="size-4" />
                Live Preview
            </Button>
            <a href={url} rel="noopener noreferrer" target="_blank">
                <Button className="gap-2" variant="outline">
                    <ExternalLink className="size-4" />
                    Open in Browser
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
        </>
    );
}
