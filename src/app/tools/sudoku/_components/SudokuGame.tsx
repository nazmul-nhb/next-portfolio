'use client';

import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import {
    BadgeQuestionMark,
    BrushCleaning,
    Calculator,
    CircleGauge,
    Flame,
    Grid3x3,
    Pause,
    Play,
    RotateCcw,
    Shuffle,
    Timer,
    Zap,
} from 'lucide-react';
import { useStorage } from 'nhb-hooks';
import { toTitleCase } from 'nhb-toolbox/change-case';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ScoreCard from '@/app/tools/sudoku/_components/ScoreCard';
import EmptyData from '@/components/misc/empty-data';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useStopwatch } from '@/lib/hooks/use-stopwatch';
import { copyGrid, generateSudoku, type SudokuDifficulty, solveSudoku } from '@/lib/sudoku';
import { parseMsToDuration } from '@/lib/utils';
import SudokuGrid from './SudokuGrid';

type Scores = Record<SudokuDifficulty, number>;

interface GameState {
    puzzle: number[][];
    solved: number[][];
    current: number[][];
    difficulty: SudokuDifficulty;
    scores: {
        current: Partial<Scores>;
        best: Scores;
        totalSolved: Scores;
    };
    isSolvedByUser: boolean;
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
    const [isPaused, setIsPaused] = useState(false);
    const [providedSolution, setProvidedSolution] = useState(false);

    const stopwatch = useStopwatch({
        autoStart: true,
        interval: 50,
    });

    const [selectedDifficulty, setSelectedDifficulty] = useState<SudokuDifficulty>('medium');

    const handleCellChange = useCallback(
        (row: number, col: number, value: number) => {
            if (!gameStore.value) return;

            // Don't allow changing puzzle clues
            if (gameStore.value.puzzle[row][col] !== 0) return;

            const newCurrent = gameStore.value.current.map((r) => [...r]);
            newCurrent[row][col] = value;

            const updatedState: GameState = {
                ...gameStore.value,
                current: newCurrent,
                isSolvedByUser: false,
                scores: {
                    current: { [selectedDifficulty]: stopwatch.elapsed },
                    best: { ...gameStore.value?.scores.best },
                    totalSolved: gameStore.value?.scores.totalSolved ?? {
                        easy: 0,
                        hard: 0,
                        medium: 0,
                    },
                },
            };

            gameStore.set(updatedState);
        },
        [gameStore, selectedDifficulty, stopwatch.elapsed]
    );

    const handleSolve = useCallback(() => {
        if (!gameStore.value) return;

        const newState = {
            ...gameStore.value,
            isSolvedByUser: false,
            current: copyGrid(gameStore.value.solved),
        };

        setIsPaused(false);
        setProvidedSolution(true);

        gameStore.set(newState);
    }, [gameStore]);

    const isComplete = useMemo(() => {
        if (!gameStore.value) return false;

        return gameStore.value.current.every((row) => row.every((cell) => cell !== 0));
    }, [gameStore.value]);

    const isSolved = useMemo(() => {
        if (!gameStore.value) return false;

        return gameStore.value.current.every((row, i) =>
            row.every((cell, j) => cell === gameStore.value?.solved[i][j])
        );
    }, [gameStore.value]);

    const handleReset = useCallback(() => {
        if (!gameStore.value) return;

        const newState = {
            ...gameStore.value,
            isSolvedByUser: false,
            current: copyGrid(gameStore.value.puzzle),
        };

        setIsPaused(false);
        setProvidedSolution(false);

        gameStore.set(newState);
    }, [gameStore]);

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
                isSolvedByUser: false,
                scores: {
                    current: { [difficulty]: 0 },
                    best: gameStore.value?.scores.best ?? { easy: 0, hard: 0, medium: 0 },
                    totalSolved: gameStore.value?.scores.totalSolved ?? {
                        easy: 0,
                        hard: 0,
                        medium: 0,
                    },
                },
            };

            stopwatch.reset();

            setIsPaused(false);
            setProvidedSolution(false);
            setSelectedDifficulty(difficulty);

            gameStore.set(newState);
        },
        [gameStore, stopwatch.reset]
    );

    useEffect(() => {
        if (isComplete) {
            stopwatch.pause();

            if (
                isSolved &&
                !providedSolution &&
                gameStore.value &&
                !gameStore.value.isSolvedByUser
            ) {
                const prevBestScores = gameStore.value?.scores.best;

                const newBest = { ...prevBestScores };

                const prevBest = prevBestScores[selectedDifficulty];

                newBest[selectedDifficulty] =
                    prevBest === 0 ? stopwatch.elapsed : Math.min(prevBest, stopwatch.elapsed);

                const prevTotal = gameStore.value?.scores.totalSolved;

                const newTotalSolved = {
                    ...prevTotal,
                    [selectedDifficulty]: prevTotal[selectedDifficulty] + 1,
                };

                const newState: GameState = {
                    ...gameStore.value,
                    isSolvedByUser: true,
                    scores: {
                        current: { [selectedDifficulty]: stopwatch.elapsed },
                        best: newBest,
                        totalSolved: newTotalSolved,
                    },
                };

                gameStore.set(newState);
            }
        }
    }, [
        stopwatch.pause,
        stopwatch.elapsed,
        gameStore.set,
        gameStore.value,
        isComplete,
        isSolved,
        providedSolution,
        selectedDifficulty,
    ]);

    // Initialize game
    useEffect(() => {
        if (gameStore.value) {
            setSelectedDifficulty(gameStore.value.difficulty);
        } else {
            generateNewGame('medium');
        }

        if (!isComplete && !isPaused) stopwatch.start();
    }, [gameStore.value, isComplete, isPaused, generateNewGame, stopwatch.start]);

    const handlePauseGame = () => {
        if (!gameStore.value) return;

        setIsPaused((prev) => !prev);
        stopwatch.toggle();
    };

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
                    {gameStore.value ? (
                        <Card className="overflow-hidden">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Grid3x3 className="size-5" />
                                    Play Sudoku
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
                                            {isSolved
                                                ? '✓ Puzzle Solved!'
                                                : '✗ Incorrect Solution'}
                                        </span>
                                    ) : (
                                        'Use keyboard (1-9) or arrow keys to navigate'
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 flex-wrap">
                                    <SudokuGrid
                                        current={gameStore.value.current}
                                        handlePauseGame={handlePauseGame}
                                        isPaused={isPaused}
                                        isSolved={isSolved}
                                        onCellChange={handleCellChange}
                                        puzzle={gameStore.value.puzzle}
                                    />

                                    <div className="space-y-5">
                                        <ScoreCard
                                            className=""
                                            Icon={Timer}
                                            score={parseMsToDuration(stopwatch.elapsed)}
                                            title="Elapsed Time"
                                        />
                                        <ScoreCard
                                            Icon={Zap}
                                            score={parseMsToDuration(
                                                gameStore.value.scores.best[selectedDifficulty]
                                            )}
                                            title={`Best Time in ${toTitleCase(selectedDifficulty)} Mode`}
                                        />
                                        <ScoreCard
                                            Icon={Calculator}
                                            score={
                                                gameStore.value.scores.totalSolved[
                                                    selectedDifficulty
                                                ]
                                            }
                                            title={`Total Puzzles Solved in ${toTitleCase(selectedDifficulty)} Mode`}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <EmptyData
                            description="There is something wrong with your game settings, please reload the window!"
                            Icon={Grid3x3}
                            title="Invalid Game State"
                        />
                    )}
                </motion.div>

                {/* Controls Panel */}
                <motion.div className="space-y-4" variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <CircleGauge className="size-4" />
                                Difficulty
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Select
                                onValueChange={(val) =>
                                    generateNewGame(val as SudokuDifficulty)
                                }
                                value={selectedDifficulty}
                            >
                                <SelectTrigger className="w-full">
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
                            <CardTitle className="text-base flex items-center gap-2">
                                <Flame className="size-4" /> Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <Button
                                disabled={isSolved}
                                onClick={handlePauseGame}
                                variant="outline"
                            >
                                {isPaused ? (
                                    <Play className="size-4" />
                                ) : (
                                    <Pause className="size-4" />
                                )}
                                {isPaused ? 'Start' : 'Pause'}
                            </Button>

                            <Button onClick={handleReset} variant="destructive">
                                <RotateCcw className="size-4" />
                                Reset
                            </Button>

                            <Button disabled={isSolved} onClick={handleSolve} variant="default">
                                <Zap className="size-4" />
                                Show Solution
                            </Button>

                            <Button onClick={gameStore.remove} variant="destructive">
                                <BrushCleaning className="size-4" />
                                Clear Records
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <BadgeQuestionMark className="size-4" /> How to Play
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1 text-blue-900 dark:text-blue-100">
                            <ul className="ml-8 list-item list-disc space-y-1">
                                <li>Use arrow keys to navigate</li>
                                <li>
                                    Press{' '}
                                    <KbdGroup>
                                        <Kbd>1</Kbd>-<Kbd>9</Kbd>
                                    </KbdGroup>{' '}
                                    to enter numbers
                                </li>
                                <li>
                                    Press <Kbd>Delete</Kbd>/<Kbd>Backspace</Kbd>/<Kbd>0</Kbd> to
                                    clear
                                </li>
                                <li>Red cells indicate conflicts</li>
                            </ul>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
