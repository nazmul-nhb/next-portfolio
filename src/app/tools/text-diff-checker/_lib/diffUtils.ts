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
 * Simple line-based text diff algorithm
 * Uses longest common subsequence approach for better results
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

    // Calculate stats
    let linesAdded = 0;
    let linesRemoved = 0;
    let linesChanged = 0;
    let linesUnchanged = 0;

    for (const line of diffLines) {
        if (line.type === 'added') {
            linesAdded++;
        } else if (line.type === 'removed') {
            linesRemoved++;
        } else if (line.type === 'unchanged') {
            linesUnchanged++;
        }
    }

    // Lines changed = min of added and removed (paired changes)
    linesChanged = Math.min(linesAdded, linesRemoved);
    linesAdded -= linesChanged;
    linesRemoved -= linesChanged;

    return {
        lines: diffLines,
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
 * Highlight differences at the character level within a line
 */
export function getCharacterDifferences(original: string, modified: string): CharDiffResult {
    // Simple implementation: mark characters that differ
    const result: CharDiffResult = {
        original: [],
        modified: [],
    };

    const maxLen = Math.max(original.length, modified.length);

    for (let i = 0; i < maxLen; i++) {
        const origChar = original[i] || '';
        const modChar = modified[i] || '';

        const isDifferent = origChar !== modChar;

        if (origChar) {
            result.original.push({
                text: origChar,
                highlighted: isDifferent,
            });
        }

        if (modChar) {
            result.modified.push({
                text: modChar,
                highlighted: isDifferent,
            });
        }
    }

    return result;
}
