'use client';

import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Copy, RotateCcw, Shuffle, Zap } from 'lucide-react';
import { useStorage } from 'nhb-hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { copyGrid, generateSudoku, type SudokuDifficulty, solveSudoku } from '@/lib/sudoku';
import SudokuGrid from './SudokuGrid';

interface GameState {
    puzzle: number[][];
    solved: number[][];
    current: number[][];
    difficulty: SudokuDifficulty;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};

export default function SudokuGame() {
    const gameStore = useStorage<GameState | null>({ key: 'nhb-sudoku-game' });

    const [gameState, setGameState] = useState<GameState | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<SudokuDifficulty>('medium');

    const generateNewGame = useCallback(
        (difficulty: SudokuDifficulty) => {
            const puzzle = generateSudoku(difficulty);
            const solved = copyGrid(puzzle);
            solveSudoku(solved);

            const newState: GameState = {
                puzzle,
                solved,
                current: copyGrid(puzzle),
                difficulty,
            };

            setGameState(newState);
            setSelectedDifficulty(difficulty);
            gameStore.set(newState);
        },
        [gameStore]
    );

    // Initialize game
    useEffect(() => {
        if (gameStore.value) {
            setGameState(gameStore.value);
            setSelectedDifficulty(gameStore.value.difficulty);
        } else {
            generateNewGame('medium');
        }
    }, [gameStore.value, generateNewGame]);

    const handleCellChange = useCallback(
        (row: number, col: number, value: number) => {
            if (!gameState) return;

            // Don't allow changing puzzle clues
            if (gameState.puzzle[row][col] !== 0) return;

            const newCurrent = gameState.current.map((r) => [...r]);
            newCurrent[row][col] = value;

            const updatedState = { ...gameState, current: newCurrent };
            setGameState(updatedState);
            gameStore.set(updatedState);
        },
        [gameState, gameStore]
    );

    const handleReset = useCallback(() => {
        if (!gameState) return;

        const newState = {
            ...gameState,
            current: copyGrid(gameState.puzzle),
        };

        setGameState(newState);
        gameStore.set(newState);
    }, [gameState, gameStore]);

    const handleSolve = useCallback(() => {
        if (!gameState) return;

        const newState = {
            ...gameState,
            current: copyGrid(gameState.solved),
        };

        setGameState(newState);
        gameStore.set(newState);
    }, [gameState, gameStore]);

    const isComplete = useMemo(() => {
        if (!gameState) return false;

        return gameState.current.every((row) => row.every((cell) => cell !== 0));
    }, [gameState]);

    const isSolved = useMemo(() => {
        if (!gameState) return false;

        return gameState.current.every((row, i) =>
            row.every((cell, j) => cell === gameState.solved[i][j])
        );
    }, [gameState]);

    if (!gameState) {
        return null;
    }

    return (
        <motion.div
            animate="visible"
            className="space-y-8"
            initial="hidden"
            variants={containerVariants}
        >
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1fr_minmax(20rem,350px)]">
                {/* Main Grid */}
                <motion.div variants={itemVariants}>
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shuffle className="size-5" />
                                Sudoku Grid
                            </CardTitle>
                            <CardDescription>
                                {isComplete ? (
                                    <span
                                        className={
                                            isSolved
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }
                                    >
                                        {isSolved ? '✓ Puzzle Solved!' : '✗ Incorrect Solution'}
                                    </span>
                                ) : (
                                    'Use keyboard (1-9) or arrow keys to navigate'
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center">
                                <SudokuGrid
                                    current={gameState.current}
                                    onCellChange={handleCellChange}
                                    puzzle={gameState.puzzle}
                                    solved={gameState.solved}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Controls Panel */}
                <motion.div className="space-y-4" variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Difficulty</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Select
                                onValueChange={(val) =>
                                    generateNewGame(val as SudokuDifficulty)
                                }
                                value={selectedDifficulty}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy (38 clues)</SelectItem>
                                    <SelectItem value="medium">Medium (28 clues)</SelectItem>
                                    <SelectItem value="hard">Hard (18 clues)</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                className="w-full gap-2"
                                onClick={() => generateNewGame(selectedDifficulty)}
                                variant="default"
                            >
                                <Shuffle className="size-4" />
                                New Puzzle
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                className="w-full gap-2"
                                onClick={handleReset}
                                variant="outline"
                            >
                                <RotateCcw className="size-4" />
                                Reset
                            </Button>

                            <Button
                                className="w-full gap-2"
                                onClick={handleSolve}
                                variant="outline"
                            >
                                <Zap className="size-4" />
                                Show Solution
                            </Button>

                            <Button
                                className="w-full gap-2"
                                onClick={() => window.location.reload()}
                                variant="ghost"
                            >
                                <Copy className="size-4" />
                                Clear Storage
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardHeader>
                            <CardTitle className="text-base">How to Play</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1 text-blue-900 dark:text-blue-100">
                            <p>• Use arrow keys to navigate</p>
                            <p>• Press 1-9 to enter numbers</p>
                            <p>• Press Delete/Backspace to clear</p>
                            <p>• Red cells indicate conflicts</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
