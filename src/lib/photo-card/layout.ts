import type { PhotoCardConfig, PhotoCardSectionId } from './types';

export type PhotoCardSectionBounds = {
    section: PhotoCardSectionId;
    x: number;
    y: number;
    width: number;
    height: number;
};

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

export function getSectionHeight(config: PhotoCardConfig, section: PhotoCardSectionId): number {
    if (section === 'header') {
        return config.sections.header.enabled ? config.sections.header.height : 0;
    }

    if (section === 'footer') {
        return config.sections.footer.enabled ? config.sections.footer.height : 0;
    }

    const headerHeight: number = getSectionHeight(config, 'header');
    const footerHeight: number = getSectionHeight(config, 'footer');

    return Math.max(40, config.height - headerHeight - footerHeight);
}

export function getSectionBounds(
    config: PhotoCardConfig,
    section: PhotoCardSectionId
): PhotoCardSectionBounds {
    const headerHeight = getSectionHeight(config, 'header');
    const footerHeight = getSectionHeight(config, 'footer');

    if (section === 'header') {
        return {
            section,
            x: 0,
            y: 0,
            width: config.width,
            height: headerHeight,
        };
    }

    if (section === 'footer') {
        return {
            section,
            x: 0,
            y: config.height - footerHeight,
            width: config.width,
            height: footerHeight,
        };
    }

    return {
        section,
        x: 0,
        y: headerHeight,
        width: config.width,
        height: Math.max(40, config.height - headerHeight - footerHeight),
    };
}

export function getAbsoluteLayerPosition(
    config: PhotoCardConfig,
    section: PhotoCardSectionId,
    x: number,
    y: number
) {
    const bounds = getSectionBounds(config, section);

    return {
        x: bounds.x + x,
        y: bounds.y + y,
    };
}

export function clampLayerPositionToSection(
    config: PhotoCardConfig,
    section: PhotoCardSectionId,
    layerWidth: number,
    layerHeight: number,
    x: number,
    y: number
) {
    const bounds = getSectionBounds(config, section);

    return {
        x: clamp(Math.round(x), 0, Math.max(0, bounds.width - layerWidth)),
        y: clamp(Math.round(y), 0, Math.max(0, bounds.height - layerHeight)),
    };
}
