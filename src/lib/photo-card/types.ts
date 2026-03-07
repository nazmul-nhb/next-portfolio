import { z } from 'zod';
import { PHOTO_CARD_FONT_IDS, PHOTO_CARD_SECTION_IDS } from './constants';

// Re-export constants for backward compatibility
export {
    PHOTO_CARD_FONT_IDS,
    PHOTO_CARD_FONT_OPTIONS,
    PHOTO_CARD_SECTION_IDS,
    PHOTO_CARD_SECTION_LABELS,
    PHOTO_CARD_SECTION_OPTIONS,
} from './constants';

// Re-export utilities for backward compatibility
export {
    createTextLayer,
    DEFAULT_PHOTO_CARD_CONFIG,
    getPhotoCardFontOption,
    normalizePhotoCardConfig,
} from './utils';

// Type definitions
export type PhotoCardFontId = (typeof PHOTO_CARD_FONT_IDS)[number];
export type PhotoCardSectionId = (typeof PHOTO_CARD_SECTION_IDS)[number];

export type PhotoCardSectionConfig = {
    enabled: boolean;
    height: number;
    backgroundColor: string;
};

export type ImageLayer = {
    id: string;
    section: PhotoCardSectionId;
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
    section: PhotoCardSectionId;
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
    sections: {
        header: PhotoCardSectionConfig;
        footer: PhotoCardSectionConfig;
    };
    images: ImageLayer[];
    texts: TextLayer[];
};

const HexColorSchema = z
    .string()
    .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Use a valid hex color.');

export const CanvasDimensionSchema = z.coerce
    .number()
    .int('Use whole pixels.')
    .min(120, 'Canvas size must be at least 120px.')
    .max(4000, 'Canvas size must be at most 4000px.');

export const LayerPositionSchema = z.coerce
    .number()
    .int('Use whole pixels.')
    .min(0, 'Position must be at least 0px.')
    .max(5000, 'Position must be at most 5000px.');

export const LayerSizeSchema = z.coerce
    .number()
    .int('Use whole pixels.')
    .min(1, 'Size must be at least 1px.')
    .max(4000, 'Size must be at most 4000px.');

export const SectionHeightSchema = z.coerce
    .number()
    .int('Use whole pixels.')
    .min(60, 'Section height must be at least 60px.')
    .max(1200, 'Section height must be at most 1200px.');

const PhotoCardSectionSchema = z.object({
    enabled: z.boolean().default(false),
    height: SectionHeightSchema.default(140),
    backgroundColor: HexColorSchema.default('#111827'),
});

export const PhotoCardImageLayerSchema = z.object({
    id: z.string().min(1),
    section: z.enum(PHOTO_CARD_SECTION_IDS).default('canvas'),
    src: z.string().min(1),
    x: LayerPositionSchema,
    y: LayerPositionSchema,
    width: LayerSizeSchema,
    height: LayerSizeSchema,
    naturalWidth: z.coerce.number().int().positive().optional(),
    naturalHeight: z.coerce.number().int().positive().optional(),
});

export const PhotoCardTextLayerSchema = z.object({
    id: z.string().min(1),
    section: z.enum(PHOTO_CARD_SECTION_IDS).default('canvas'),
    text: z.string().max(500, 'Keep each text layer within 500 characters.'),
    fontFamily: z.enum(PHOTO_CARD_FONT_IDS),
    fontSize: z.coerce
        .number()
        .int('Use whole pixels.')
        .min(8, 'Font size must be at least 8px.')
        .max(400, 'Font size must be at most 400px.'),
    color: HexColorSchema,
    x: LayerPositionSchema,
    y: LayerPositionSchema,
});

export const PhotoCardConfigSchema = z
    .object({
        width: CanvasDimensionSchema.default(1200),
        height: CanvasDimensionSchema.default(1200),
        backgroundColor: HexColorSchema.default('#0f172a'),
        sections: z
            .object({
                header: PhotoCardSectionSchema.default({
                    enabled: false,
                    height: 140,
                    backgroundColor: '#111827',
                }),
                footer: PhotoCardSectionSchema.default({
                    enabled: false,
                    height: 120,
                    backgroundColor: '#111827',
                }),
            })
            .default({
                header: {
                    enabled: false,
                    height: 140,
                    backgroundColor: '#111827',
                },
                footer: {
                    enabled: false,
                    height: 120,
                    backgroundColor: '#111827',
                },
            }),
        images: z
            .array(PhotoCardImageLayerSchema)
            .max(24, 'Use up to 24 image layers.')
            .default([]),
        texts: z
            .array(PhotoCardTextLayerSchema)
            .max(24, 'Use up to 24 text layers.')
            .default([]),
    })
    .superRefine((config, ctx) => {
        const headerHeight = config.sections.header.enabled ? config.sections.header.height : 0;
        const footerHeight = config.sections.footer.enabled ? config.sections.footer.height : 0;

        if (headerHeight + footerHeight >= config.height - 40) {
            ctx.addIssue({
                code: 'custom',
                message:
                    'Header and footer together must leave at least 40px for the main canvas area.',
                path: ['sections'],
            });
        }
    });
