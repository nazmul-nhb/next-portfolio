import type { HSL } from 'nhb-toolbox/colors/types';

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
]);

/**
 * Normalize and process text
 */
export function processText(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\w\s'-]/g, '') // Remove punctuation except hyphens and apostrophes
        .split(/\s+/)
        .filter((word) => word.length > 1 && !DEFAULT_STOPWORDS.has(word));
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
    minSize: number = 12,
    maxSize: number = 72
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
        colors.push(`hsl(${Math.round(hue)}, 70%, 50%)`);
    }

    return colors;
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

        // Spiral outward
        radius += 5 + fontSize / 10;
        angle += Math.random() * 0.1 + 0.1;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        positioned.push({
            ...word,
            x: Math.max(20, Math.min(width - 20, x)),
            y: Math.max(30, Math.min(height - 30, y)),
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

    return words.map((word, i) => ({
        ...word,
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50,
        fontSize: calculateFontSize(word.frequency, minFreq, maxFreq),
        color: colors[i % colors.length],
    }));
}
