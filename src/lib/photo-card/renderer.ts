import {
    anekBangla,
    cascadiaCode,
    geistMono,
    geistSans,
    inter,
    playfairDisplay,
    poppins,
    robotoMono,
    sourceSans,
    tiroBangla,
} from '@/lib/fonts';
import { normalizePhotoCardConfig } from '@/lib/photo-card/utils';
import { hasErrorMessage } from '@/lib/utils';
import type { FontId } from '@/types';
import { getAbsoluteLayerPosition, getSectionBounds } from './layout';
import type { PhotoCardConfig, TextLayer } from './types';

const imageCache = new Map<string, Promise<HTMLImageElement>>();
let fontsReadyPromise: Promise<void> | null = null;
let textMeasureCanvas: HTMLCanvasElement | null = null;

const FONT_FAMILY_MAP: Record<FontId, string> = {
    inter: inter.style.fontFamily,
    poppins: poppins.style.fontFamily,
    playfair: playfairDisplay.style.fontFamily,
    'roboto-mono': robotoMono.style.fontFamily,
    'anek-bangla': anekBangla.style.fontFamily,
    'tiro-bangla': tiroBangla.style.fontFamily,
    'cascadia-code': cascadiaCode.style.fontFamily,
    'geist-mono': geistMono.style.fontFamily,
    'geist-sans': geistSans.style.fontFamily,
    'source-sans': sourceSans.style.fontFamily,
};

export function resolvePhotoCardFontFamily(fontId: FontId) {
    return FONT_FAMILY_MAP[fontId] ?? inter.style.fontFamily;
}

async function ensureFontsReady() {
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

function getTextMeasureContext() {
    if (typeof document === 'undefined') {
        return null;
    }

    if (!textMeasureCanvas) {
        textMeasureCanvas = document.createElement('canvas');
    }

    return textMeasureCanvas.getContext('2d');
}

export function measureTextLayer(layer: TextLayer) {
    const context = getTextMeasureContext();
    const lineHeight = Math.round(layer.fontSize * 1.2);
    const lines = layer.text.split('\n');

    if (!context) {
        return {
            width: Math.max(layer.fontSize * 2, 40),
            height: Math.max(lineHeight * lines.length, lineHeight),
        };
    }

    context.font = `${layer.fontSize}px ${resolvePhotoCardFontFamily(layer.fontFamily)}`;

    const width = Math.ceil(
        Math.max(
            ...lines.map((line) => context.measureText(line || ' ').width),
            layer.fontSize * 1.5
        )
    );

    return {
        width,
        height: Math.max(lineHeight * lines.length, lineHeight),
    };
}

function drawTextLayer(
    context: CanvasRenderingContext2D,
    config: PhotoCardConfig,
    layer: TextLayer
) {
    const { x, y } = getAbsoluteLayerPosition(config, layer.section, layer.x, layer.y);

    context.save();
    context.fillStyle = layer.color;
    context.textBaseline = 'top';
    context.font = `${layer.fontSize}px ${resolvePhotoCardFontFamily(layer.fontFamily)}`;

    const lineHeight = Math.round(layer.fontSize * 1.2);

    layer.text.split('\n').forEach((line, index) => {
        context.fillText(line, x, y + lineHeight * index);
    });

    context.restore();
}

function drawSectionBackground(context: CanvasRenderingContext2D, config: PhotoCardConfig) {
    const headerBounds = getSectionBounds(config, 'header');
    const footerBounds = getSectionBounds(config, 'footer');

    if (config.sections.header.enabled && headerBounds.height > 0) {
        context.fillStyle = config.sections.header.backgroundColor;
        context.fillRect(
            headerBounds.x,
            headerBounds.y,
            headerBounds.width,
            headerBounds.height
        );
    }

    if (config.sections.footer.enabled && footerBounds.height > 0) {
        context.fillStyle = config.sections.footer.backgroundColor;
        context.fillRect(
            footerBounds.x,
            footerBounds.y,
            footerBounds.width,
            footerBounds.height
        );
    }
}

export async function renderPhotoCardToCanvas(
    canvas: HTMLCanvasElement,
    config: PhotoCardConfig
) {
    const parsed = normalizePhotoCardConfig(config);
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Canvas rendering is not available in this browser.');
    }

    canvas.width = parsed.width;
    canvas.height = parsed.height;

    context.clearRect(0, 0, parsed.width, parsed.height);
    context.fillStyle = parsed.backgroundColor;
    context.fillRect(0, 0, parsed.width, parsed.height);

    drawSectionBackground(context, parsed);

    const loadedImages = await Promise.all(
        parsed.images.map(async (layer) => ({
            layer,
            image: await loadImage(layer.src),
        }))
    );

    for (const { layer, image } of loadedImages) {
        const position = getAbsoluteLayerPosition(parsed, layer.section, layer.x, layer.y);

        context.drawImage(image, position.x, position.y, layer.width, layer.height);
    }

    await ensureFontsReady();

    for (const textLayer of parsed.texts) {
        drawTextLayer(context, parsed, textLayer);
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
