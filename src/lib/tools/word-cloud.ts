import type { HSL } from 'nhb-toolbox/colors/types';
import { LOWERCASED_WORDS } from 'nhb-toolbox/constants';
import { FONT_OPTIONS } from '@/lib/constants';

export interface WordFrequency {
    word: string;
    frequency: number;
}

export interface WordPosition extends WordFrequency {
    x: number;
    y: number;
    fontSize: number;
    color: string;
}

export const WORD_CLOUD_DEFAULTS = {
    canvasWidth: 1600,
    canvasHeight: 1200,

    minFontSize: 40,
    maxFontSize: 160,

    minFontWeight: 300,
    maxFontWeight: 900,

    minRotation: 5,
    maxRotation: 270,
} as const;

export const FONT_FAMILIES_WORD_CLOUD = [
    {
        value: 'system-ui',
        label: 'System UI',
        fontFamily: 'system-ui',
    },
    {
        value: 'arial',
        label: 'Arial',
        fontFamily: '"Arial"',
    },
    ...FONT_OPTIONS,
    {
        value: 'times',
        label: 'Times New Roman',
        fontFamily: '"Times New Roman"',
    },
    {
        value: 'digital',
        label: 'Digital Clock',
        fontFamily: '"Digital-7 Mono"',
    },
    {
        value: 'verdana',
        label: 'Verdana',
        fontFamily: '"Verdana"',
    },
    {
        value: 'courier',
        label: 'Courier',
        fontFamily: '"Courier"',
    },
] as const;

const DEFAULT_STOPWORDS = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'is',
    'are',
    'am',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'can',
    'this',
    'that',
    'these',
    'those',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'what',
    'which',
    'who',
    'when',
    'where',
    'why',
    'how',
    ...LOWERCASED_WORDS,
]);

/**
 * Normalize and process text
 */
export function processText(text: string, skipStopwords: boolean = true): string[] {
    const processed = text
        .normalize('NFC') // IMPORTANT for combining chars like Bangla
        .toLocaleLowerCase()
        .replace(/[^\p{L}\p{M}\p{N}\s'-]/gu, '') // keep letters + marks + numbers
        .split(/\s+/)
        .filter((word) => word.length >= (skipStopwords ? 2 : 1));

    return skipStopwords ? processed.filter((word) => !DEFAULT_STOPWORDS.has(word)) : processed;
}

/**
 * Calculate word frequencies
 */
export function calculateFrequencies(words: string[]): WordFrequency[] {
    const frequencies = new Map<string, number>();

    words.forEach((word) => {
        frequencies.set(word, (frequencies.get(word) || 0) + 1);
    });

    return Array.from(frequencies.entries())
        .map(([word, frequency]) => ({ word, frequency }))
        .sort((a, b) => b.frequency - a.frequency);
}

/**
 * Get top N words by frequency
 */
export function getTopWords(frequencies: WordFrequency[], limit: number): WordFrequency[] {
    return frequencies.slice(0, Math.min(limit, frequencies.length));
}

/**
 * Calculate font size based on frequency
 */
export function calculateFontSize(
    frequency: number,
    minFreq: number,
    maxFreq: number,
    minSize: number = 24,
    maxSize: number = 120
): number {
    if (maxFreq === minFreq) return (minSize + maxSize) / 2;

    const normalized = (frequency - minFreq) / (maxFreq - minFreq);
    return Math.round(minSize + normalized * (maxSize - minSize));
}

/**
 * Generate color palette (hue-based)
 */
export function generateColorPalette(count: number): HSL[] {
    const colors: HSL[] = [];

    for (let i = 0; i < count; i++) {
        const hue = (i / count) * 360;
        colors.push(`hsl(${Math.round(hue)}, 66%, 55%)`);
    }

    return colors;
}

/**
 * Calculate text bounding box dimensions (approximate)
 */
function getTextBounds(text: string, fontSize: number): { width: number; height: number } {
    // Rough estimate: average character width is about 0.6x font size
    const width = text.length * fontSize * 0.55;
    const height = fontSize * 1.2;
    return { width, height };
}

/**
 * Spiral layout algorithm
 */
export function spiralLayout(
    words: WordFrequency[],
    width: number = 800,
    height: number = 600,
    colors: string[] = generateColorPalette(words.length)
): WordPosition[] {
    const positioned: WordPosition[] = [];
    const centerX = width / 2;
    const centerY = height / 2;

    const minFreq = Math.min(...words.map((w) => w.frequency));
    const maxFreq = Math.max(...words.map((w) => w.frequency));

    let angle = 0;
    let radius = 0;

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const fontSize = calculateFontSize(word.frequency, minFreq, maxFreq);
        const color = colors[i % colors.length];
        const bounds = getTextBounds(word.word, fontSize);

        // Spiral outward
        radius += Math.max(10, fontSize / 5);
        angle += Math.random() * 0.15 + 0.1;

        let x = centerX + Math.cos(angle) * radius;
        let y = centerY + Math.sin(angle) * radius;

        // Clamp to canvas with text dimensions
        const padding = 40;
        x = Math.max(
            padding + bounds.width / 2,
            Math.min(width - padding - bounds.width / 2, x)
        );
        y = Math.max(
            padding + bounds.height / 2,
            Math.min(height - padding - bounds.height / 2, y)
        );

        positioned.push({
            ...word,
            x,
            y,
            fontSize,
            color,
        });
    }

    return positioned;
}

/**
 * Random layout algorithm
 */
export function randomLayout(
    words: WordFrequency[],
    width: number = 800,
    height: number = 600,
    colors: string[] = generateColorPalette(words.length)
): WordPosition[] {
    const minFreq = Math.min(...words.map((w) => w.frequency));
    const maxFreq = Math.max(...words.map((w) => w.frequency));
    const padding = 40;

    return words.map((word, i) => {
        const fontSize = calculateFontSize(word.frequency, minFreq, maxFreq);
        const bounds = getTextBounds(word.word, fontSize);

        const x =
            Math.random() * (width - 2 * padding - bounds.width) + padding + bounds.width / 2;
        const y =
            Math.random() * (height - 2 * padding - bounds.height) +
            padding +
            bounds.height / 2;

        return {
            ...word,
            x,
            y,
            fontSize,
            color: colors[i % colors.length],
        };
    });
}
