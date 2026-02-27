'use client';

import Image from 'next/image';
import { useState } from 'react';
import { buildCloudinaryUrl, cn } from '@/lib/utils';

interface ScreenshotGalleryProps {
    screenshots: string[];
    title: string;
}

/** Interactive screenshot gallery with thumbnail selection. */
export default function ScreenshotGallery({ screenshots, title }: ScreenshotGalleryProps) {
    const [activeIdx, setActiveIdx] = useState(0);

    if (screenshots.length === 0) return null;

    return (
        <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-video overflow-hidden rounded-xl border border-border/50 bg-muted">
                <Image
                    alt={`${title} - Screenshot ${activeIdx + 1}`}
                    className="h-full w-full object-cover transition-all duration-300"
                    height={600}
                    priority={activeIdx === 0}
                    src={buildCloudinaryUrl(screenshots[activeIdx])}
                    width={1200}
                />
            </div>

            {/* Thumbnails */}
            {screenshots.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {screenshots.map((screenshot, idx) => (
                        <button
                            className={cn(
                                'relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:w-28',
                                activeIdx === idx
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-border/50 opacity-70 hover:opacity-100'
                            )}
                            key={screenshot}
                            onClick={() => setActiveIdx(idx)}
                            type="button"
                        >
                            <Image
                                alt={`${title} - Thumbnail ${idx + 1}`}
                                className="h-full w-full object-cover"
                                height={80}
                                src={buildCloudinaryUrl(screenshot)}
                                width={140}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
