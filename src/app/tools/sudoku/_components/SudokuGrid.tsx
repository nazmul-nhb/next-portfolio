'use client';

import { Pause } from 'lucide-react';
import { useRef, useState } from 'react';
import { getConflicts } from '@/lib/tools/sudoku';
import { cn } from '@/lib/utils';
import type { TypedKeyboardEvent } from '@/types/hot-keys';
import KeypadDrawer from './KeypadDrawer';

interface SudokuGridProps {
    puzzle: number[][];
    current: number[][];
    isSolved: boolean;
    isPaused: boolean;
    handlePauseGame: () => void;
    onCellChange: (row: number, col: number, value: number) => void;
}

const GRID_SIZE = 9;
const BOX_SIZE = 3;

export default function SudokuGrid({
    puzzle,
    isPaused,
    isSolved,
    handlePauseGame,
    current,
    onCellChange,
}: SudokuGridProps) {
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

    const gridRef = useRef<HTMLDivElement>(null);

    const handleCellClick = (row: number, col: number) => {
        if (puzzle[row][col] === 0) {
            setSelectedCell({ row, col });
        }
    };

    const handleKeyDown = (e: TypedKeyboardEvent<HTMLDivElement>) => {
        if (!selectedCell) return;

        e.preventDefault();
        e.stopPropagation();

        const key = e.key;

        const { row, col } = selectedCell;

        if (key === 'ArrowUp' && row > 0) {
            setSelectedCell({ row: row - 1, col });
        } else if (key === 'ArrowDown' && row < GRID_SIZE - 1) {
            setSelectedCell({ row: row + 1, col });
        } else if (key === 'ArrowLeft' && col > 0) {
            setSelectedCell({ row, col: col - 1 });
        } else if (key === 'ArrowRight' && col < GRID_SIZE - 1) {
            setSelectedCell({ row, col: col + 1 });
        } else if (key >= '1' && key <= '9') {
            onCellChange(row, col, +key);
        } else if (key === 'Delete' || key === 'Backspace' || key === '0') {
            onCellChange(row, col, 0);
        } else if (key === ' ' && !isSolved) {
            handlePauseGame();
        }
    };

    /**
     * Shared input handler (keyboard + numpad)
     */
    const handleInput = (value: number) => {
        if (!selectedCell) return;
        const { row, col } = selectedCell;
        onCellChange(row, col, value);
    };

    const getHighlightedCells = (): Set<string> => {
        const highlighted = new Set<string>();

        if (!selectedCell) return highlighted;

        const { row, col } = selectedCell;

        // Highlight row
        for (let i = 0; i < GRID_SIZE; i++) {
            highlighted.add(`${row}-${i}`);
        }

        // Highlight column
        for (let i = 0; i < GRID_SIZE; i++) {
            highlighted.add(`${i}-${col}`);
        }

        // Highlight box
        const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
        const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

        for (let i = boxRow; i < boxRow + BOX_SIZE; i++) {
            for (let j = boxCol; j < boxCol + BOX_SIZE; j++) {
                highlighted.add(`${i}-${j}`);
            }
        }

        return highlighted;
    };

    const highlightedCells = getHighlightedCells();

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                className="inline-block size-fit relative border-2 border-gray-900 dark:border-gray-100"
                onKeyDown={handleKeyDown}
                ref={gridRef}
                role="grid"
                tabIndex={0}
            >
                {/* Grid */}
                <div
                    className={cn({
                        'blur-sm pointer-events-none select-none h-fit': isPaused,
                    })}
                >
                    {current.map((row, rowIdx) => (
                        <div className="flex" key={rowIdx}>
                            {row.map((cell, colIdx) => {
                                const cellKey = `${rowIdx}-${colIdx}`;
                                const isSelected =
                                    selectedCell?.row === rowIdx &&
                                    selectedCell?.col === colIdx;
                                const isHighlighted = highlightedCells.has(cellKey);
                                const isPuzzleCell = puzzle[rowIdx][colIdx] !== 0;
                                const conflicts = isPuzzleCell
                                    ? new Set<string>()
                                    : getConflicts(current, rowIdx, colIdx);
                                const hasConflict = conflicts.size > 0;

                                const borderRight =
                                    (colIdx + 1) % BOX_SIZE === 0 && colIdx !== GRID_SIZE - 1;
                                const borderBottom =
                                    (rowIdx + 1) % BOX_SIZE === 0 && rowIdx !== GRID_SIZE - 1;

                                return (
                                    <button
                                        className={cn(
                                            'size-8 sm:size-11 md:size-12 flex items-center justify-center',
                                            'text-lg font-bold transition-colors focus:outline-none',
                                            'border border-gray-300 dark:border-gray-600',
                                            isPuzzleCell
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-default'
                                                : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
                                            {
                                                'border-r-2 border-r-gray-900 dark:border-r-gray-100':
                                                    borderRight,
                                                'border-b-2 border-b-gray-900 dark:border-b-gray-100':
                                                    borderBottom,
                                                'border-2 border-gray-900 dark:border-gray-100':
                                                    isSelected,
                                                'bg-blue-100 dark:bg-blue-900/40':
                                                    isHighlighted && !isSelected,
                                                'bg-red-100 dark:bg-red-900/75 text-red-900 dark:text-red-100':
                                                    hasConflict,
                                            }
                                        )}
                                        disabled={isPuzzleCell}
                                        key={cellKey}
                                        onClick={() => handleCellClick(rowIdx, colIdx)}
                                        type="button"
                                    >
                                        {cell !== 0 && cell}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Pause */}
                {isPaused && (
                    <div className="absolute select-none inset-0 flex items-center justify-center">
                        <button
                            className="px-6 py-3 rounded-lg bg-black/70 text-white flex flex-col items-center justify-center text-lg font-semibold backdrop-blur"
                            onClick={handlePauseGame}
                            type="button"
                        >
                            <Pause className="size-16" />
                            Game Paused
                        </button>
                    </div>
                )}
            </div>

            <KeypadDrawer
                gridRef={gridRef}
                hasSelection={Boolean(selectedCell)}
                isPaused={isPaused}
                onInput={handleInput}
            />
        </div>
    );
}
