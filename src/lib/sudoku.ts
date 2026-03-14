export type SudokuDifficulty = 'easy' | 'medium' | 'hard';

const EMPTY = 0;
const GRID_SIZE = 9;
const BOX_SIZE = 3;

/**
 * Check if a number is valid at a specific position
 */
export function isValidMove(grid: number[][], row: number, col: number, num: number): boolean {
    // Check row
    for (let i = 0; i < GRID_SIZE; i++) {
        if (grid[row][i] === num) return false;
    }

    // Check column
    for (let i = 0; i < GRID_SIZE; i++) {
        if (grid[i][col] === num) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

    for (let i = boxRow; i < boxRow + BOX_SIZE; i++) {
        for (let j = boxCol; j < boxCol + BOX_SIZE; j++) {
            if (grid[i][j] === num) return false;
        }
    }

    return true;
}

/**
 * Solve sudoku using backtracking
 */
export function solveSudoku(grid: number[][]): boolean {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] === EMPTY) {
                for (let num = 1; num <= GRID_SIZE; num++) {
                    if (isValidMove(grid, row, col, num)) {
                        grid[row][col] = num;

                        if (solveSudoku(grid)) {
                            return true;
                        }

                        grid[row][col] = EMPTY;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

/**
 * Deep copy a sudoku grid
 */
export function copyGrid(grid: number[][]): number[][] {
    return grid.map((row) => [...row]);
}

/**
 * Count solutions (to verify unique solution)
 */
function countSolutions(grid: number[][], limit: number = 2): number {
    let count = 0;

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] === EMPTY) {
                for (let num = 1; num <= GRID_SIZE; num++) {
                    if (isValidMove(grid, row, col, num)) {
                        grid[row][col] = num;
                        count += countSolutions(grid, limit);

                        if (count >= limit) {
                            grid[row][col] = EMPTY;
                            return count;
                        }

                        grid[row][col] = EMPTY;
                    }
                }
                return count;
            }
        }
    }
    return count + 1;
}

/**
 * Generate a valid sudoku puzzle with unique solution
 */
export function generateSudoku(difficulty: SudokuDifficulty): number[][] {
    // Create solved grid first
    const solved = createSolvedGrid();

    // Remove numbers based on difficulty
    const clues = difficulty === 'easy' ? 38 : difficulty === 'medium' ? 28 : 18;

    return removeNumbers(copyGrid(solved), clues);
}

/**
 * Create a valid solved sudoku grid
 */
function createSolvedGrid(): number[][] {
    const grid: number[][] = Array(GRID_SIZE)
        .fill(null)
        .map(() => Array(GRID_SIZE).fill(EMPTY));

    // Fill diagonal 3x3 boxes first (they don't conflict)
    for (let box = 0; box < 3; box++) {
        const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        const boxRow = box * BOX_SIZE;
        const boxCol = box * BOX_SIZE;

        for (let i = 0; i < BOX_SIZE; i++) {
            for (let j = 0; j < BOX_SIZE; j++) {
                grid[boxRow + i][boxCol + j] = nums[i * BOX_SIZE + j];
            }
        }
    }

    // Solve rest using backtracking
    solveSudoku(grid);
    return grid;
}

/**
 * Remove numbers from solved grid to create puzzle
 */
function removeNumbers(grid: number[][], clues: number): number[][] {
    const positions: [number, number][] = [];

    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            positions.push([i, j]);
        }
    }

    positions.sort(() => Math.random() - 0.5);

    const toRemove = 81 - clues;
    let removed = 0;

    for (const [row, col] of positions) {
        if (removed >= toRemove) break;

        const backup = grid[row][col];
        grid[row][col] = EMPTY;

        const testGrid = copyGrid(grid);
        if (countSolutions(testGrid, 2) === 1) {
            removed++;
        } else {
            grid[row][col] = backup;
        }
    }

    return grid;
}

/**
 * Shuffle array (Fisher-Yates)
 */
function shuffleArray<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Check for conflicts in a cell
 */
export function getConflicts(
    grid: number[][],
    row: number,
    col: number
): Set<`${number}-${number}`> {
    const conflicts = new Set<`${number}-${number}`>();
    const num = grid[row][col];

    if (num === EMPTY) return conflicts;

    // Check row
    for (let i = 0; i < GRID_SIZE; i++) {
        if (i !== col && grid[row][i] === num) {
            conflicts.add(`${row}-${i}`);
        }
    }

    // Check column
    for (let i = 0; i < GRID_SIZE; i++) {
        if (i !== row && grid[i][col] === num) {
            conflicts.add(`${i}-${col}`);
        }
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

    for (let i = boxRow; i < boxRow + BOX_SIZE; i++) {
        for (let j = boxCol; j < boxCol + BOX_SIZE; j++) {
            if ((i !== row || j !== col) && grid[i][j] === num) {
                conflicts.add(`${i}-${j}`);
            }
        }
    }

    return conflicts;
}
