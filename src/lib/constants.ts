export const UUID_VERSIONS = ['v1', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8'] as const;
export const BULK_UUID_LIMIT = 9999;

/**
 * Font configuration options for photo card text layers
 */
export const FONT_OPTIONS = [
    {
        value: 'inter',
        label: 'Inter',
        fontFamily: '"Inter"',
    },
    {
        value: 'poppins',
        label: 'Poppins',
        fontFamily: '"Poppins"',
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
    {
        value: 'anek-bangla',
        label: 'Anek Bangla',
        fontFamily: '"Anek Bangla"',
    },
    {
        value: 'tiro-bangla',
        label: 'Tiro Bangla',
        fontFamily: '"Tiro Bangla"',
    },
    {
        value: 'source-sans',
        label: 'Source Sans',
        fontFamily: '"Source Sans"',
    },
    {
        value: 'cascadia-code',
        label: 'Cascadia Code',
        fontFamily: '"Cascadia Code"',
    },
    {
        value: 'geist-sans',
        label: 'Geist Sans',
        fontFamily: '"Geist Sans"',
    },
    {
        value: 'geist-mono',
        label: 'Geist Mono',
        fontFamily: '"Geist Mono"',
    },
] as const;

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

export const PKG_FIELDS = [
    'author',
    'time',
    'contributors',
    'dist-tags',
    'description',
    'homepage',
    'license',
    'maintainers',
    'repository',
] as const;

export const NPM_START = '2010-01-01';
