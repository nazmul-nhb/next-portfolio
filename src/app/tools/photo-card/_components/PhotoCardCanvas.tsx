'use client';

import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { ImageOff, Layers3 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { getPhotoCardColorTokens } from '@/lib/photo-card/colors';
import { PHOTO_CARD_SECTION_LABELS } from '@/lib/photo-card/constants';
import {
    clampLayerPositionToSection,
    getAbsoluteLayerPosition,
    getSectionBounds,
} from '@/lib/photo-card/layout';
import { measureTextLayer, renderPhotoCardToCanvas } from '@/lib/photo-card/renderer';
import { PhotoCardConfigSchema } from '@/lib/photo-card/schema';
import type { ImageLayer, PhotoCardConfig, TextLayer } from '@/lib/photo-card/types';
import { cn } from '@/lib/utils';
import PhotoCardStageLayer from './PhotoCardStageLayer';

type Props = {
    activeImageId: string | null;
    activeTextId: string | null;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    config: PhotoCardConfig;
    onImageChange: (id: string, patch: Partial<ImageLayer>) => void;
    onSelectImage: (id: string) => void;
    onSelectText: (id: string) => void;
    onTextChange: (id: string, patch: Partial<TextLayer>) => void;
    onAddImages?: (files: File[], section: 'canvas' | 'header' | 'footer') => void;
};

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, Math.round(value)));
}

/**
 * Interactive canvas preview component with draggable and resizable layers
 * Provides real-time visual feedback for layer positioning and sizing
 */
export default function PhotoCardCanvas({
    activeImageId,
    activeTextId,
    canvasRef,
    config,
    onImageChange,
    onSelectImage,
    onSelectText,
    onTextChange,
    onAddImages,
}: Props) {
    const [containerWidth, setContainerWidth] = useState(0);
    const [renderError, setRenderError] = useState<string | null>(null);
    const renderIdRef = useRef(0);
    const viewportRef = useRef<HTMLDivElement>(null);

    const validation = useMemo(() => PhotoCardConfigSchema.safeParse(config), [config]);

    useEffect(() => {
        const element = viewportRef.current;

        if (!element || typeof ResizeObserver === 'undefined') return;

        const observer = new ResizeObserver(([entry]) => {
            setContainerWidth(entry.contentRect.width);
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        if (!validation.success) {
            setRenderError(
                validation.error.issues[0]?.message ?? 'Invalid photo card configuration.'
            );
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = Math.max(1, config.width);
                canvas.height = Math.max(1, config.height);
                context.clearRect(0, 0, canvas.width, canvas.height);
            }

            return;
        }

        setRenderError(null);

        const currentRenderId = ++renderIdRef.current;
        const frameId = window.requestAnimationFrame(() => {
            void (async () => {
                try {
                    const previewCanvas = document.createElement('canvas');

                    await renderPhotoCardToCanvas(previewCanvas, validation.data);

                    if (currentRenderId !== renderIdRef.current || !canvasRef.current) {
                        return;
                    }

                    const targetCanvas = canvasRef.current;
                    const targetContext = targetCanvas.getContext('2d');

                    if (!targetContext) {
                        setRenderError('Canvas preview is not supported in this browser.');
                        return;
                    }

                    targetCanvas.width = previewCanvas.width;
                    targetCanvas.height = previewCanvas.height;
                    targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
                    targetContext.drawImage(previewCanvas, 0, 0);
                } catch (error) {
                    console.error(error);
                    setRenderError(
                        'Preview rendering failed. Check the selected assets and try again.'
                    );
                }
            })();
        });

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [canvasRef, config, validation]);

    const scale = useMemo(() => {
        if (!containerWidth) return 1;

        return Math.min(1, containerWidth / config.width);
    }, [config.width, containerWidth]);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            if (!validation.success || scale <= 0) return;

            const [kind, id] = String(event.active.id).split(':');
            const deltaX = event.delta.x / scale;
            const deltaY = event.delta.y / scale;

            if (kind === 'image') {
                const layer = validation.data.images.find((item) => item.id === id);

                if (!layer) return;

                const nextPosition = clampLayerPositionToSection(
                    validation.data,
                    layer.section,
                    layer.width,
                    layer.height,
                    layer.x + deltaX,
                    layer.y + deltaY
                );

                onImageChange(id, nextPosition);
                return;
            }

            if (kind === 'text') {
                const layer = validation.data.texts.find((item) => item.id === id);

                if (!layer) return;

                const metrics = measureTextLayer(layer);
                const nextPosition = clampLayerPositionToSection(
                    validation.data,
                    layer.section,
                    metrics.width,
                    metrics.height,
                    layer.x + deltaX,
                    layer.y + deltaY
                );

                onTextChange(id, nextPosition);
            }
        },
        [onImageChange, onTextChange, scale, validation]
    );

    const startImageResize = useCallback(
        (layer: ImageLayer, event: React.PointerEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            onSelectImage(layer.id);

            const startX = event.clientX;
            const startY = event.clientY;
            const startWidth = layer.width;
            const startHeight = layer.height;
            const aspectRatio =
                (layer.naturalWidth ?? layer.width) / (layer.naturalHeight ?? layer.height);
            const sectionBounds = getSectionBounds(config, layer.section);
            const maintainRatio = layer.maintainAspectRatio !== false; // Default to true

            const onMove = (pointerEvent: PointerEvent) => {
                const deltaX = (pointerEvent.clientX - startX) / scale;
                const deltaY = (pointerEvent.clientY - startY) / scale;

                if (maintainRatio) {
                    // Keep aspect ratio
                    const delta = Math.max(deltaX, deltaY);
                    let nextWidth = clamp(
                        startWidth + delta,
                        24,
                        sectionBounds.width - layer.x
                    );
                    let nextHeight = Math.round(nextWidth / aspectRatio);

                    if (nextHeight > sectionBounds.height - layer.y) {
                        nextHeight = sectionBounds.height - layer.y;
                        nextWidth = Math.round(nextHeight * aspectRatio);
                    }

                    onImageChange(layer.id, {
                        width: Math.max(24, nextWidth),
                        height: Math.max(24, nextHeight),
                    });
                } else {
                    // Free resize
                    const nextWidth = clamp(
                        startWidth + deltaX,
                        24,
                        sectionBounds.width - layer.x
                    );
                    const nextHeight = clamp(
                        startHeight + deltaY,
                        24,
                        sectionBounds.height - layer.y
                    );

                    onImageChange(layer.id, {
                        width: Math.max(24, nextWidth),
                        height: Math.max(24, nextHeight),
                    });
                }
            };

            const onUp = () => {
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onUp);
            };

            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
        },
        [config, onImageChange, onSelectImage, scale]
    );

    const startTextResize = useCallback(
        (layer: TextLayer, event: React.PointerEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            onSelectText(layer.id);

            const startX = event.clientX;
            const startY = event.clientY;
            const startFontSize = layer.fontSize;
            const sectionBounds = getSectionBounds(config, layer.section);

            const onMove = (pointerEvent: PointerEvent) => {
                const delta = Math.max(
                    (pointerEvent.clientX - startX) / scale,
                    (pointerEvent.clientY - startY) / scale
                );
                let nextFontSize = clamp(startFontSize + delta / 4, 8, 400);
                let metrics = measureTextLayer({
                    ...layer,
                    fontSize: nextFontSize,
                });

                while (
                    nextFontSize > 8 &&
                    (metrics.width > sectionBounds.width - layer.x ||
                        metrics.height > sectionBounds.height - layer.y)
                ) {
                    nextFontSize -= 1;
                    metrics = measureTextLayer({
                        ...layer,
                        fontSize: nextFontSize,
                    });
                }

                onTextChange(layer.id, {
                    fontSize: nextFontSize,
                });
            };

            const onUp = () => {
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onUp);
            };

            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
        },
        [config, onSelectText, onTextChange, scale]
    );

    const [dragActive, setDragActive] = useState(false);

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (event.dataTransfer.types.includes('Files')) {
            event.dataTransfer.dropEffect = 'copy';
            setDragActive(true);
        }
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(false);
    }, []);

    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setDragActive(false);

            if (!onAddImages) return;

            const files = Array.from(event.dataTransfer.files).filter((file) =>
                file.type.startsWith('image/')
            );

            if (files.length > 0) {
                onAddImages(files, 'canvas');
            }
        },
        [onAddImages]
    );

    const hasAnyVisualLayer = config.images.length > 0 || config.texts.length > 0;
    const stageWidth = config.width * scale;
    const stageHeight = config.height * scale;

    return (
        <Card className="custom-scroll overflow-y-auto xl:sticky xl:top-20 rounded-none bg-transparent">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Layers3 className="size-5" />
                    Interactive Preview
                </CardTitle>
                <CardDescription>
                    Drag images onto canvas to add. You can reposition and/or resize layers.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 p-1.5">
                <div
                    className={cn(
                        'custom-scroll overflow-auto rounded-none border bg-muted/30 px-2 py-2.5 transition-colors',
                        dragActive && 'border-primary bg-primary/5'
                    )}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <div className="w-full" ref={viewportRef}>
                        <div
                            className="mx-auto"
                            style={{ height: stageHeight, width: stageWidth }}
                        >
                            <div
                                className="relative origin-top-left group"
                                style={{
                                    height: config.height,
                                    transform: `scale(${scale})`,
                                    transformOrigin: 'top left',
                                    width: config.width,
                                }}
                            >
                                {/* Canvas Background */}
                                <canvas
                                    className="absolute inset-0 size-full border bg-background shadow-sm pointer-events-none"
                                    ref={canvasRef}
                                />

                                {/* Interactive Layers */}
                                <DndContext autoScroll={false} onDragEnd={handleDragEnd}>
                                    <div className="absolute inset-0 overflow-hidden">
                                        {/* Section Boundaries */}
                                        {(['header', 'canvas', 'footer'] as const).map(
                                            (section) => {
                                                const bounds = getSectionBounds(
                                                    config,
                                                    section
                                                );
                                                const isVisible =
                                                    section === 'canvas' ||
                                                    (section === 'header'
                                                        ? config.sections.header.enabled
                                                        : config.sections.footer.enabled);

                                                if (!isVisible || bounds.height <= 0)
                                                    return null;

                                                const accentColor =
                                                    section === 'header'
                                                        ? config.sections.header.backgroundColor
                                                        : section === 'footer'
                                                          ? config.sections.footer
                                                                .backgroundColor
                                                          : config.backgroundColor;
                                                const tokens =
                                                    getPhotoCardColorTokens(accentColor);

                                                return (
                                                    <div
                                                        className="pointer-events-none absolute rounded-xl border border-dashed"
                                                        key={`section-${section}`}
                                                        style={{
                                                            backgroundColor:
                                                                section === 'canvas'
                                                                    ? 'transparent'
                                                                    : tokens.surface,
                                                            borderColor: tokens.border,
                                                            height: bounds.height,
                                                            left: bounds.x,
                                                            top: bounds.y,
                                                            width: bounds.width,
                                                        }}
                                                    >
                                                        <div
                                                            className="absolute left-3 top-3 rounded-full px-3 py-1 text-2xl uppercase tracking-wider"
                                                            style={{
                                                                backgroundColor: tokens.base,
                                                                color: tokens.foreground,
                                                            }}
                                                        >
                                                            {PHOTO_CARD_SECTION_LABELS[section]}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}

                                        {/* Image Layers */}
                                        {validation.success &&
                                            validation.data.images.map((layer) => {
                                                const position = getAbsoluteLayerPosition(
                                                    validation.data,
                                                    layer.section,
                                                    layer.x,
                                                    layer.y
                                                );
                                                const accentColor =
                                                    layer.section === 'header'
                                                        ? validation.data.sections.header
                                                              .backgroundColor
                                                        : layer.section === 'footer'
                                                          ? validation.data.sections.footer
                                                                .backgroundColor
                                                          : validation.data.backgroundColor;

                                                return (
                                                    <PhotoCardStageLayer
                                                        accentColor={accentColor}
                                                        id={`image:${layer.id}`}
                                                        key={`image-${layer.id}`}
                                                        label="Image"
                                                        onResizePointerDown={(event) =>
                                                            startImageResize(layer, event)
                                                        }
                                                        onSelect={() => onSelectImage(layer.id)}
                                                        rect={{
                                                            height: layer.height,
                                                            width: layer.width,
                                                            x: position.x,
                                                            y: position.y,
                                                        }}
                                                        selected={activeImageId === layer.id}
                                                    />
                                                );
                                            })}

                                        {/* Text Layers */}
                                        {validation.success &&
                                            validation.data.texts.map((layer) => {
                                                const metrics = measureTextLayer(layer);
                                                const position = getAbsoluteLayerPosition(
                                                    validation.data,
                                                    layer.section,
                                                    layer.x,
                                                    layer.y
                                                );
                                                const accentColor =
                                                    layer.section === 'header'
                                                        ? validation.data.sections.header
                                                              .backgroundColor
                                                        : layer.section === 'footer'
                                                          ? validation.data.sections.footer
                                                                .backgroundColor
                                                          : validation.data.backgroundColor;

                                                return (
                                                    <PhotoCardStageLayer
                                                        accentColor={accentColor}
                                                        id={`text:${layer.id}`}
                                                        key={`text-${layer.id}`}
                                                        label="Text"
                                                        onResizePointerDown={(event) =>
                                                            startTextResize(layer, event)
                                                        }
                                                        onSelect={() => onSelectText(layer.id)}
                                                        rect={{
                                                            height: metrics.height,
                                                            width: metrics.width,
                                                            x: position.x,
                                                            y: position.y,
                                                        }}
                                                        selected={activeTextId === layer.id}
                                                    />
                                                );
                                            })}
                                    </div>
                                </DndContext>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error or Empty State */}
                {renderError ? (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {renderError}
                    </div>
                ) : !hasAnyVisualLayer &&
                  !config.sections.header.enabled &&
                  !config.sections.footer.enabled ? (
                    <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                        <ImageOff className="mx-auto mb-2 size-5" />
                        Add an image or text layer to compose your photo card.
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
