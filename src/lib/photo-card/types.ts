import { z } from 'zod';

export const PHOTO_CARD_FONT_OPTIONS = [
    {
        value: 'inter',
        label: 'Inter',
        fontFamily: 'Inter',
    },
    {
        value: 'poppins',
        label: 'Poppins',
        fontFamily: 'Poppins',
    },
    {
        value: 'playfair',
        label: 'Playfair',
        fontFamily: '"Playfair Display"',
    },
    {
        value: 'roboto-mono',
        label: 'Roboto Mono',
        fontFamily: '"Roboto Mono"',
    },
] as const;

export const PHOTO_CARD_FONT_IDS = ['inter', 'poppins', 'playfair', 'roboto-mono'] as const;

export type PhotoCardFontId = (typeof PHOTO_CARD_FONT_OPTIONS)[number]['value'];

export type ImageLayer = {
    id: string;
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    naturalWidth?: number;
    naturalHeight?: number;
};

export type TextLayer = {
    id: string;
    text: string;
    fontFamily: PhotoCardFontId;
    fontSize: number;
    color: string;
    x: number;
    y: number;
};

export type PhotoCardConfig = {
    width: number;
    height: number;
    backgroundColor: string;
    images: ImageLayer[];
    texts: TextLayer[];
};

const HexColorSchema = z
    .string()
    .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Use a valid hex color.');

const PositionSchema = z.coerce
    .number()
    .int('Use whole pixels.')
    .min(-5000, 'Position must be at least -5000px.')
    .max(5000, 'Position must be at most 5000px.');

export const CanvasDimensionSchema = z.coerce
    .number()
    .int('Use whole pixels.')
    .min(120, 'Canvas size must be at least 120px.')
    .max(4000, 'Canvas size must be at most 4000px.');

export const PhotoCardImageLayerSchema = z.object({
    id: z.string().min(1),
    src: z.string().min(1),
    x: PositionSchema,
    y: PositionSchema,
    width: z.coerce
        .number()
        .int('Use whole pixels.')
        .min(1, 'Image width must be at least 1px.')
        .max(4000, 'Image width must be at most 4000px.'),
    height: z.coerce
        .number()
        .int('Use whole pixels.')
        .min(1, 'Image height must be at least 1px.')
        .max(4000, 'Image height must be at most 4000px.'),
    naturalWidth: z.coerce.number().int().positive().optional(),
    naturalHeight: z.coerce.number().int().positive().optional(),
});

export const PhotoCardTextLayerSchema = z.object({
    id: z.string().min(1),
    text: z.string().max(500, 'Keep each text layer within 500 characters.'),
    fontFamily: z.enum(PHOTO_CARD_FONT_IDS),
    fontSize: z.coerce
        .number()
        .int('Use whole pixels.')
        .min(8, 'Font size must be at least 8px.')
        .max(400, 'Font size must be at most 400px.'),
    color: HexColorSchema,
    x: PositionSchema,
    y: PositionSchema,
});

export const PhotoCardConfigSchema = z.object({
    width: CanvasDimensionSchema,
    height: CanvasDimensionSchema,
    backgroundColor: HexColorSchema,
    images: z.array(PhotoCardImageLayerSchema).max(24, 'Use up to 24 image layers.'),
    texts: z.array(PhotoCardTextLayerSchema).max(24, 'Use up to 24 text layers.'),
});

export function createTextLayer(index = 0): TextLayer {
    return {
        id: crypto.randomUUID(),
        text: index === 0 ? 'Your photo card title' : `Text layer ${index + 1}`,
        fontFamily: index % 2 === 0 ? 'playfair' : 'inter',
        fontSize: index === 0 ? 64 : 32,
        color: '#ffffff',
        x: 72,
        y: 88 + index * 72,
    };
}

export const DEFAULT_PHOTO_CARD_CONFIG: PhotoCardConfig = {
    width: 1200,
    height: 628,
    backgroundColor: '#0f172a',
    images: [],
    texts: [createTextLayer(0)],
};

export function getPhotoCardFontOption(fontId: PhotoCardFontId) {
    return (
        PHOTO_CARD_FONT_OPTIONS.find((option) => option.value === fontId) ??
        PHOTO_CARD_FONT_OPTIONS[0]
    );
}
