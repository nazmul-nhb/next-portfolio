/**
 * Font configuration options for photo card text layers
 */
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

/**
 * Valid font IDs for type safety
 */
export const PHOTO_CARD_FONT_IDS = ['inter', 'poppins', 'playfair', 'roboto-mono'] as const;

/**
 * Valid section IDs for the photo card (header, canvas, footer)
 */
export const PHOTO_CARD_SECTION_IDS = ['canvas', 'header', 'footer'] as const;

/**
 * Human-readable labels for each section
 */
export const PHOTO_CARD_SECTION_LABELS = {
    canvas: 'Canvas',
    header: 'Header',
    footer: 'Footer',
} as const;

/**
 * Section options for UI dropdowns
 */
export const PHOTO_CARD_SECTION_OPTIONS = PHOTO_CARD_SECTION_IDS.map((value) => ({
    value,
    label: PHOTO_CARD_SECTION_LABELS[value],
})) as ReadonlyArray<{ value: (typeof PHOTO_CARD_SECTION_IDS)[number]; label: string }>;
