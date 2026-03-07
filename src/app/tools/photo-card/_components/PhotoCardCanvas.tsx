'use client';

import { ImageOff, Layers3 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { renderPhotoCardToCanvas } from '@/lib/photo-card/renderer';
import { type PhotoCardConfig, PhotoCardConfigSchema } from '@/lib/photo-card/types';

type Props = {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    config: PhotoCardConfig;
};

export default function PhotoCardCanvas({ canvasRef, config }: Props) {
    const [renderError, setRenderError] = useState<string | null>(null);
    const renderIdRef = useRef(0);

    const validation = useMemo(() => PhotoCardConfigSchema.safeParse(config), [config]);

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
    }, [canvasRef, config.height, config.width, validation]);

    return (
        <Card className="xl:sticky xl:top-20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Layers3 className="size-5" />
                    Live Preview
                </CardTitle>
                <CardDescription>
                    {config.width} × {config.height}px canvas with {config.images.length} image
                    {config.images.length === 1 ? '' : 's'} and {config.texts.length} text layer
                    {config.texts.length === 1 ? '' : 's'}.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="custom-scroll overflow-auto rounded-2xl border bg-muted/30 p-4">
                    <canvas
                        className="mx-auto h-auto max-w-full rounded-xl border bg-background shadow-sm"
                        ref={canvasRef}
                    />
                </div>

                {renderError ? (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {renderError}
                    </div>
                ) : config.images.length === 0 && config.texts.length === 0 ? (
                    <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                        <ImageOff className="mx-auto mb-2 size-5" />
                        Add an image or a text layer to start composing your photo card.
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
