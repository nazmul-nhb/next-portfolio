export type DiffLineType = 'added' | 'removed' | 'unchanged' | 'modified';

export interface DiffLine {
    type: DiffLineType;
    original?: string;
    modified?: string;
    index: number;
}

export interface DiffResult {
    lines: DiffLine[];
    stats: {
        linesAdded: number;
        linesRemoved: number;
        linesChanged: number;
        linesUnchanged: number;
    };
}

/**
 * Calculate similarity between two strings using Levenshtein-like approach
 * Returns a score between 0 and 1 (1 = identical, 0 = completely different)
 */
function calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);

    if (maxLen === 0) return 1;

    // Quick check for identical strings
    if (str1 === str2) return 1;

    // Calculate edit distance
    const matrix: number[][] = Array(len1 + 1)
        .fill(null)
        .map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    const distance = matrix[len1][len2];
    return 1 - distance / maxLen;
}

/**
 * Line-based text diff algorithm using LCS
 * Detects modified lines by pairing similar removed/added line pairs
 */
export function computeTextDiff(originalText: string, modifiedText: string): DiffResult {
    const originalLines = originalText.split('\n');
    const modifiedLines = modifiedText.split('\n');

    const originalLen = originalLines.length;
    const modifiedLen = modifiedLines.length;

    // Build LCS table
    const lcs = Array(originalLen + 1)
        .fill(null)
        .map(() => Array(modifiedLen + 1).fill(0));

    for (let i = 1; i <= originalLen; i++) {
        for (let j = 1; j <= modifiedLen; j++) {
            if (originalLines[i - 1] === modifiedLines[j - 1]) {
                lcs[i][j] = lcs[i - 1][j - 1] + 1;
            } else {
                lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
            }
        }
    }

    // Backtrack to find the diff
    const diffLines: DiffLine[] = [];
    let i = originalLen;
    let j = modifiedLen;
    let lineIndex = 0;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && originalLines[i - 1] === modifiedLines[j - 1]) {
            // No change
            diffLines.unshift({
                type: 'unchanged',
                original: originalLines[i - 1],
                modified: modifiedLines[j - 1],
                index: lineIndex,
            });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
            // Added line
            diffLines.unshift({
                type: 'added',
                modified: modifiedLines[j - 1],
                index: lineIndex,
            });
            j--;
        } else if (i > 0) {
            // Removed line
            diffLines.unshift({
                type: 'removed',
                original: originalLines[i - 1],
                index: lineIndex,
            });
            i--;
        }
        lineIndex++;
    }

    // Post-process: Detect and pair similar removed/added lines as "modified"
    const processedLines: DiffLine[] = [];
    const usedIndices = new Set<number>();
    const SIMILARITY_THRESHOLD = 0.6;

    for (let idx = 0; idx < diffLines.length; idx++) {
        if (usedIndices.has(idx)) continue;

        const line = diffLines[idx];

        if (line.type === 'removed') {
            // Look ahead for a similar added line
            for (let jdx = idx + 1; jdx < diffLines.length; jdx++) {
                if (usedIndices.has(jdx)) continue;

                const nextLine = diffLines[jdx];
                if (nextLine.type === 'added') {
                    const similarity = calculateSimilarity(
                        line.original || '',
                        nextLine.modified || ''
                    );

                    if (similarity >= SIMILARITY_THRESHOLD) {
                        // Mark as modified
                        processedLines.push({
                            type: 'modified',
                            original: line.original,
                            modified: nextLine.modified,
                            index: idx,
                        });
                        usedIndices.add(idx);
                        usedIndices.add(jdx);
                        break;
                    }
                }
            }

            // If not paired, add as removed
            if (!usedIndices.has(idx)) {
                processedLines.push(line);
                usedIndices.add(idx);
            }
        } else if (line.type !== 'added' || !usedIndices.has(idx)) {
            // Add unchanged lines and unpaired added lines
            if (line.type !== 'added' || !usedIndices.has(idx)) {
                processedLines.push(line);
                usedIndices.add(idx);
            }
        }
    }

    // Calculate stats
    let linesAdded = 0;
    let linesRemoved = 0;
    let linesChanged = 0;
    let linesUnchanged = 0;

    for (const line of processedLines) {
        if (line.type === 'added') {
            linesAdded++;
        } else if (line.type === 'removed') {
            linesRemoved++;
        } else if (line.type === 'modified') {
            linesChanged++;
        } else if (line.type === 'unchanged') {
            linesUnchanged++;
        }
    }

    return {
        lines: processedLines,
        stats: {
            linesAdded,
            linesRemoved,
            linesChanged,
            linesUnchanged,
        },
    };
}

type CharDiffResult = {
    original: Array<{ text: string; highlighted: boolean }>;
    modified: Array<{ text: string; highlighted: boolean }>;
};

/**
 * Build LCS table for character-level diff
 */
function buildCharLcsTable(original: string, modified: string): number[][] {
    const origLen = original.length;
    const modLen = modified.length;

    const lcs = Array(origLen + 1)
        .fill(null)
        .map(() => Array(modLen + 1).fill(0));

    for (let i = 1; i <= origLen; i++) {
        for (let j = 1; j <= modLen; j++) {
            if (original[i - 1] === modified[j - 1]) {
                lcs[i][j] = lcs[i - 1][j - 1] + 1;
            } else {
                lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
            }
        }
    }

    return lcs;
}

/**
 * Backtrack through LCS table to find matching character indices
 */
function getLcsIndices(original: string, modified: string, lcs: number[][]): Set<number>[] {
    const origLen = original.length;
    const modLen = modified.length;

    const origMatched = new Set<number>();
    const modMatched = new Set<number>();

    let i = origLen;
    let j = modLen;

    while (i > 0 && j > 0) {
        if (original[i - 1] === modified[j - 1]) {
            origMatched.add(i - 1);
            modMatched.add(j - 1);
            i--;
            j--;
        } else if (lcs[i - 1][j] > lcs[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    return [origMatched, modMatched];
}

/**
 * Highlight differences at the character level within a line using LCS
 * More sophisticated than position-by-position comparison
 */
export function getCharacterDifferences(original: string, modified: string): CharDiffResult {
    const result: CharDiffResult = {
        original: [],
        modified: [],
    };

    // Handle empty strings
    if (!original && !modified) return result;
    if (!original) {
        return {
            original: [],
            modified: modified.split('').map((text) => ({ text, highlighted: true })),
        };
    }
    if (!modified) {
        return {
            original: original.split('').map((text) => ({ text, highlighted: true })),
            modified: [],
        };
    }

    // Build LCS table for character-level matching
    const lcsTable = buildCharLcsTable(original, modified);
    const [origMatched, modMatched] = getLcsIndices(original, modified, lcsTable);

    // Build original string with highlighting
    for (let i = 0; i < original.length; i++) {
        result.original.push({
            text: original[i],
            highlighted: !origMatched.has(i),
        });
    }

    // Build modified string with highlighting
    for (let j = 0; j < modified.length; j++) {
        result.modified.push({
            text: modified[j],
            highlighted: !modMatched.has(j),
        });
    }

    return result;
}
