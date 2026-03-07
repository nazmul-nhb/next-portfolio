import { inter, playfairDisplay, poppins, robotoMono } from '@/lib/fonts';
import { hasErrorMessage } from '@/lib/utils';
import type { PhotoCardConfig, PhotoCardFontId, TextLayer } from './types';
import { PhotoCardConfigSchema } from './types';

const imageCache = new Map<string, Promise<HTMLImageElement>>();
let fontsReadyPromise: Promise<void> | null = null;

const FONT_FAMILY_MAP: Record<PhotoCardFontId, string> = {
    inter: inter.style.fontFamily,
    poppins: poppins.style.fontFamily,
    playfair: playfairDisplay.style.fontFamily,
    'roboto-mono': robotoMono.style.fontFamily,
};

export function resolvePhotoCardFontFamily(fontId: PhotoCardFontId) {
    return FONT_FAMILY_MAP[fontId] ?? inter.style.fontFamily;
}

async function ensureFontLoaded(fontId: PhotoCardFontId) {
    void fontId;

    if (typeof document === 'undefined' || !('fonts' in document)) {
        return;
    }

    if (!fontsReadyPromise) {
        fontsReadyPromise = document.fonts.ready.then(() => undefined).catch(() => undefined);
    }

    await fontsReadyPromise;
}

async function loadImage(src: string) {
    if (!imageCache.has(src)) {
        imageCache.set(
            src,
            new Promise((resolve, reject) => {
                const image = new Image();

                image.onload = () => resolve(image);
                image.onerror = () =>
                    reject(new Error('Failed to load one of the selected images.'));
                image.src = src;
            })
        );
    }

    const cachedImage = imageCache.get(src);

    if (!cachedImage) {
        throw new Error('Failed to resolve the selected image.');
    }

    return cachedImage;
}

function drawTextLayer(context: CanvasRenderingContext2D, layer: TextLayer) {
    context.save();
    context.fillStyle = layer.color;
    context.textBaseline = 'top';
    context.font = `${layer.fontSize}px ${resolvePhotoCardFontFamily(layer.fontFamily)}`;

    const lineHeight = Math.round(layer.fontSize * 1.2);

    layer.text.split('\n').forEach((line, index) => {
        context.fillText(line, layer.x, layer.y + lineHeight * index);
    });

    context.restore();
}

export async function renderPhotoCardToCanvas(
    canvas: HTMLCanvasElement,
    config: PhotoCardConfig
) {
    const parsed = PhotoCardConfigSchema.parse(config);
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Canvas rendering is not available in this browser.');
    }

    canvas.width = parsed.width;
    canvas.height = parsed.height;

    context.clearRect(0, 0, parsed.width, parsed.height);
    context.fillStyle = parsed.backgroundColor;
    context.fillRect(0, 0, parsed.width, parsed.height);

    const loadedImages = await Promise.all(
        parsed.images.map(async (layer) => ({
            layer,
            image: await loadImage(layer.src),
        }))
    );

    for (const { layer, image } of loadedImages) {
        context.drawImage(image, layer.x, layer.y, layer.width, layer.height);
    }

    await Promise.all(
        [...new Set(parsed.texts.map((layer) => layer.fontFamily))].map((fontId) =>
            ensureFontLoaded(fontId)
        )
    );

    for (const textLayer of parsed.texts) {
        drawTextLayer(context, textLayer);
    }
}

export function canvasToBlob(
    canvas: HTMLCanvasElement,
    type: 'image/png' | 'image/jpeg',
    quality = 0.92
) {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Failed to export the current photo card.'));
                    return;
                }

                resolve(blob);
            },
            type,
            quality
        );
    });
}

export async function renderPhotoCardToBlob(
    config: PhotoCardConfig,
    type: 'image/png' | 'image/jpeg',
    quality = 0.92
) {
    if (typeof document === 'undefined') {
        throw new Error('Photo card export is only available in the browser.');
    }

    const canvas = document.createElement('canvas');

    await renderPhotoCardToCanvas(canvas, config);

    return canvasToBlob(canvas, type, quality);
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

export function getExportErrorMessage(error: unknown) {
    return hasErrorMessage(error) ? error.message : 'Failed to process the photo card.';
}
