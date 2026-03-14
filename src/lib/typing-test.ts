import { getRandomNumber } from 'nhb-toolbox';

export interface TypingMetrics {
    wpm: number;
    accuracy: number;
    errors: number;
    correctChars: number;
    totalChars: number;
}

export type TestDuration = 30 | 60 | 120;

// Sample passages for typing tests
const PASSAGES = [
    'The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once, making it useful for demonstrating typefaces and testing keyboards.',

    'Technology has revolutionized the way we communicate, work, and learn. The internet connects billions of people worldwide, enabling instant communication and access to vast amounts of information at our fingertips.',

    'Nature walks offer a perfect escape from the hustle and bustle of city life. Breathing fresh air, listening to bird songs, and observing wildlife can significantly reduce stress and improve mental well-being.',

    'Reading books is a gateway to infinite worlds and perspectives. Through literature, we can explore different cultures, time periods, and ideas, expanding our understanding of humanity and ourselves.',

    'The art of cooking combines science, creativity, and cultural tradition. A master chef understands how flavors interact, how heat transforms ingredients, and how presentation delights the senses.',

    'Climate change poses unprecedented challenges to our planet and civilization. Rising temperatures, extreme weather, and ecosystem disruption demand immediate global action and innovative solutions.',

    'Music has the power to evoke emotions, bring people together, and transcend language barriers. Whether classical symphonies or contemporary beats, melodies and rhythms shape our cultural identity.',

    'Learning a new language opens doors to new friendships, career opportunities, and cultural understanding. The process requires patience, practice, and immersion in authentic linguistic contexts.',

    'The human brain is the most complex organ in the known universe. It controls our thoughts, memories, emotions, and actions, and continues to surprise neuroscientists with its remarkable plasticity.',

    'Sustainable living means making conscious choices to minimize our environmental impact. From reducing waste to supporting renewable energy, every action contributes to a healthier planet.',
];

/**
 * Get random passage for typing test
 */
export function getRandomPassage(): string {
    return PASSAGES[getRandomNumber({ max: PASSAGES.length })];
}

/**
 * Calculate typing metrics
 */
export function calculateMetrics(
    passage: string,
    typed: string,
    secondsElapsed: number
): TypingMetrics {
    const durationInMinutes = secondsElapsed / 60;

    let correctChars = 0;
    let errors = 0;

    // Compare character by character
    for (let i = 0; i < typed.length; i++) {
        if (i < passage.length) {
            if (typed[i] === passage[i]) {
                correctChars++;
            } else {
                errors++;
            }
        } else {
            // Extra characters not in passage
            errors++;
        }
    }

    // Count missed characters
    const missedChars = Math.max(0, passage.length - typed.length);
    const totalErrors = errors + missedChars;

    // Calculate WPM (words per 5 characters)
    const wpm = Math.round(correctChars / 5 / durationInMinutes);

    // Calculate accuracy
    const totalChars = typed.length;
    const accuracy = totalChars === 0 ? 0 : Math.round((correctChars / totalChars) * 100);

    return {
        wpm: Math.max(0, wpm),
        accuracy: Math.min(100, accuracy),
        errors: totalErrors,
        correctChars,
        totalChars,
    };
}

/**
 * Format WPM for display
 */
export function formatWPM(wpm: number): string {
    return wpm.toString();
}

/**
 * Get WPM category
 */
export function getWPMCategory(wpm: number) {
    if (wpm < 20) return 'Beginner';
    if (wpm < 40) return 'Intermediate';
    if (wpm < 60) return 'Proficient';
    if (wpm < 80) return 'Advanced';
    return 'Expert';
}

/**
 * Get accuracy color
 */
export function getAccuracyColor(accuracy: number): string {
    if (accuracy >= 95) return 'text-emerald-600 dark:text-emerald-400';
    if (accuracy >= 90) return 'text-blue-600 dark:text-blue-400';
    if (accuracy >= 85) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
}

type MatchStats = 'correct' | 'incorrect' | 'missing' | 'extra' | null;

/**
 * Highlight correct and incorrect characters
 */
export function getCharacterStatus(passage: string, typed: string, index: number): MatchStats {
    if (index >= typed.length) {
        return index < passage.length ? 'missing' : null;
    }

    if (index >= passage.length) {
        return 'extra';
    }

    return typed[index] === passage[index] ? 'correct' : 'incorrect';
}
