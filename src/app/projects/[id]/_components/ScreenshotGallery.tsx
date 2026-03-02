'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCcw, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { buildCloudinaryUrl, cn } from '@/lib/utils';

interface ScreenshotGalleryProps {
    screenshots: string[];
    title: string;
}

const ZOOM_STEP = 0.2;
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

function clampZoom(value: number) {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

/** Interactive screenshot gallery with smooth animated transitions. */
export default function ScreenshotGallery({ screenshots, title }: ScreenshotGalleryProps) {
    const [activeIdx, setActiveIdx] = useState(0);

    if (screenshots.length === 0) return null;

    return (
        <div className="space-y-3">
            {/* Main image */}

            <div className="relative aspect-video overflow-hidden rounded-xl border border-border/50 bg-muted">
                <AnimatePresence mode="wait">
                    <motion.div
                        animate={{ opacity: 1, scale: 1 }}
                        className="aspect-video"
                        exit={{ opacity: 0, scale: 1 }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        key={activeIdx}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <PhotoProvider
                            loop
                            toolbarRender={({ onRotate, onScale, rotate, scale }) => {
                                return [
                                    <button
                                        aria-label="Zoom out"
                                        className="PhotoView-Slider__toolbarIcon text-white"
                                        key="zoom-out"
                                        onClick={() => onScale(clampZoom(scale - ZOOM_STEP))}
                                        type="button"
                                    >
                                        <ZoomOut size={18} />
                                    </button>,
                                    <button
                                        aria-label="Zoom in"
                                        className="PhotoView-Slider__toolbarIcon text-white"
                                        key="zoom-in"
                                        onClick={() => onScale(clampZoom(scale + ZOOM_STEP))}
                                        type="button"
                                    >
                                        <ZoomIn size={18} />
                                    </button>,
                                    <button
                                        aria-label="Rotate left"
                                        className="PhotoView-Slider__toolbarIcon text-white"
                                        key="rotate-left"
                                        onClick={() => onRotate(rotate - 90)}
                                        type="button"
                                    >
                                        <RotateCcw size={18} />
                                    </button>,
                                    <button
                                        aria-label="Rotate right"
                                        className="PhotoView-Slider__toolbarIcon text-white"
                                        key="rotate-right"
                                        onClick={() => onRotate(rotate + 90)}
                                        type="button"
                                    >
                                        <RotateCw size={18} />
                                    </button>,
                                    <button
                                        aria-label="Reset zoom and rotation"
                                        className="PhotoView-Slider__toolbarIcon text-white"
                                        key="reset"
                                        onClick={() => {
                                            onScale(1);
                                            onRotate(0);
                                        }}
                                        type="button"
                                    >
                                        <RefreshCcw size={18} />
                                    </button>,
                                ];
                            }}
                        >
                            {screenshots.map((screenshot, idx) => (
                                <PhotoView
                                    key={`${screenshot}-photo`}
                                    src={buildCloudinaryUrl(screenshot)}
                                >
                                    {idx === activeIdx ? (
                                        <Image
                                            alt={`${title} - Screenshot ${activeIdx + 1}`}
                                            className="aspect-video object-cover cursor-pointer"
                                            height={1080}
                                            priority={activeIdx === 0}
                                            quality={100}
                                            src={buildCloudinaryUrl(screenshots[activeIdx])}
                                            width={1920}
                                        />
                                    ) : (
                                        <span className="hidden" />
                                    )}
                                </PhotoView>
                            ))}
                        </PhotoProvider>
                    </motion.div>
                </AnimatePresence>
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
                                className="aspect-video object-cover"
                                height={90}
                                src={buildCloudinaryUrl(screenshot)}
                                width={160}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
