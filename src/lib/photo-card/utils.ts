import {
    PHOTO_CARD_FONT_OPTIONS,
    PHOTO_CARD_SECTION_IDS,
    PHOTO_CARD_SECTION_LABELS,
} from './constants';
import type { PhotoCardConfig, PhotoCardFontId, PhotoCardSectionId, TextLayer } from './types';
import { PhotoCardConfigSchema } from './types';

/**
 * Creates a default text layer with sensible defaults
 */
export function createTextLayer(index = 0, section: PhotoCardSectionId = 'canvas'): TextLayer {
    const isCanvas = section === 'canvas';

    return {
        id: crypto.randomUUID(),
        section,
        text:
            index === 0 && isCanvas
                ? 'Your photo card title'
                : `${PHOTO_CARD_SECTION_LABELS[section]} text ${index + 1}`,
        fontFamily: index % 2 === 0 ? 'playfair' : 'inter',
        fontSize: isCanvas ? (index === 0 ? 64 : 32) : 28,
        color: '#ffffff',
        x: isCanvas ? 72 : 24,
        y: isCanvas ? 88 + index * 72 : 24 + index * 42,
    };
}

/**
 * Default photo card configuration with initial values
 */
export const DEFAULT_PHOTO_CARD_CONFIG: PhotoCardConfig = {
    width: 1200,
    height: 1200,
    backgroundColor: '#0f172a',
    sections: {
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
    },
    images: [],
    texts: [createTextLayer(0)],
};

/**
 * Parses and validates a photo card configuration using Zod schema
 */
export function normalizePhotoCardConfig(config: unknown): PhotoCardConfig {
    return PhotoCardConfigSchema.parse(config);
}

/**
 * Gets the font option object for a given font ID
 */
export function getPhotoCardFontOption(fontId: PhotoCardFontId) {
    return (
        PHOTO_CARD_FONT_OPTIONS.find((option) => option.value === fontId) ??
        PHOTO_CARD_FONT_OPTIONS[0]
    );
}

/**
 * Validates if all required section IDs are present
 */
export function isValidSectionId(value: unknown): value is PhotoCardSectionId {
    return PHOTO_CARD_SECTION_IDS.includes(value as PhotoCardSectionId);
}
