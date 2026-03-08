import type { PHOTO_CARD_FONT_OPTIONS, PHOTO_CARD_SECTION_IDS } from './constants';

// Type definitions
export type PhotoCardFontId = (typeof PHOTO_CARD_FONT_OPTIONS)[number]['value'];
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
    maintainAspectRatio?: boolean;
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
