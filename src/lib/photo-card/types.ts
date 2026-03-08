import type { PHOTO_CARD_FONT_IDS, PHOTO_CARD_SECTION_IDS } from './constants';

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
