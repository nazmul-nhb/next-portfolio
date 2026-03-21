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
import { useMount, useStopwatch, useStorage } from 'nhb-hooks';
import { throttleAction } from 'nhb-toolbox';
import { toTitleCase } from 'nhb-toolbox/change-case';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import {
    copyGrid,
    DEFAULT_SCORES,
    generateSudoku,
    type SudokuDifficulty,
    type SudokuScores,
    solveSudoku,
} from '@/lib/tools/sudoku';
import { parseMsToDuration } from '@/lib/utils';
import SudokuGrid from './SudokuGrid';

interface GameState {
    puzzle: number[][];
    solved: number[][];
    current: number[][];
    difficulty: SudokuDifficulty;
    scores: {
        current: number;
        best: SudokuScores;
        totalSolved: SudokuScores;
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

    const stopwatch = useStopwatch({ interval: 50 });

    // Track latest elapsed time for persistence without causing effect re-runs
    const elapsedRef = useRef(0);

    const [isPaused, setIsPaused] = useState(false);
    const [isProvidedSolution, setIsProvidedSolution] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState<SudokuDifficulty>('medium');

    useEffect(() => {
        elapsedRef.current = stopwatch.elapsed;
    }, [stopwatch.elapsed]);

    const handleCellChange = throttleAction((row: number, col: number, value: number) => {
        if (!gameStore.value) return;

        // Don't allow changing puzzle clues
        if (gameStore.value.puzzle[row][col] !== 0) return;

        const newCurrent = gameStore.value.current.map((r) => [...r]);
        newCurrent[row][col] = value;

        const updatedState: GameState = {
            ...gameStore.value,
            current: newCurrent,
            isSolvedByUser: false,
        };

        gameStore.set(updatedState);
    }, 100);

    const handleSolve = useCallback(() => {
        if (!gameStore.value) return;

        const newState = {
            ...gameStore.value,
            isSolvedByUser: false,
            current: copyGrid(gameStore.value.solved),
        };

        setIsPaused(false);
        setIsProvidedSolution(true);

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

    const handleReset = throttleAction(() => {
        if (!gameStore.value) return;

        const newState = {
            ...gameStore.value,
            isSolvedByUser: false,
            current: copyGrid(gameStore.value.puzzle),
        };

        setIsPaused(false);
        setIsProvidedSolution(false);

        gameStore.set(newState);
    });

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
                    current: 0,
                    best: gameStore.value?.scores.best ?? DEFAULT_SCORES,
                    totalSolved: gameStore.value?.scores.totalSolved ?? DEFAULT_SCORES,
                },
            };

            stopwatch.reset();

            setIsPaused(false);
            setIsProvidedSolution(false);
            setSelectedDifficulty(difficulty);

            gameStore.set(newState);
        },
        [gameStore.set, gameStore.value?.scores, stopwatch.reset]
    );

    // ! Initialize game and stopwatch from localStorage
    useEffect(() => {
        if (gameStore.value) {
            setSelectedDifficulty(gameStore.value.difficulty);
            stopwatch.reset(gameStore.value.scores.current);
        } else {
            generateNewGame('medium');
        }
    }, [gameStore.value, stopwatch.reset, generateNewGame]);

    // ! Manage stopwatch play/pause based on game state
    useEffect(() => {
        // Don't start if game state is not ready
        if (!gameStore.value) return;

        // If game is complete, always pause
        if (isComplete) {
            stopwatch.pause();
            return;
        }

        // If user paused the game, pause stopwatch
        if (isPaused) {
            stopwatch.pause();
            return;
        }

        // Otherwise, start the stopwatch
        stopwatch.start();
    }, [isPaused, isComplete, gameStore.value, stopwatch.start, stopwatch.pause]);

    // ! Auto detect when completed and save scores
    useEffect(() => {
        if (isComplete) {
            stopwatch.pause();

            if (
                isSolved &&
                !isProvidedSolution &&
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
                        current: stopwatch.elapsed,
                        best: newBest,
                        totalSolved: newTotalSolved,
                    },
                };

                gameStore.set(newState);
            }
        }
    }, [
        isComplete,
        isSolved,
        isProvidedSolution,
        selectedDifficulty,
        gameStore,
        stopwatch.elapsed,
        stopwatch.pause,
    ]);

    // ! Persist current score to localStorage periodically (every 200ms)
    // This ensures the current time is saved in case user refreshes
    useEffect(() => {
        if (!gameStore.value || isComplete || isPaused) return;

        const intervalId = setInterval(() => {
            const currentState = gameStore.value;
            if (!currentState) return;

            gameStore.set({
                ...currentState,
                scores: {
                    ...currentState.scores,
                    current: elapsedRef.current,
                },
            });
        }, 200);

        return () => clearInterval(intervalId);
    }, [gameStore, isComplete, isPaused]);

    const handlePauseGame = throttleAction(() => {
        if (!gameStore.value) return;

        const newIsPaused = !isPaused;
        setIsPaused(newIsPaused);

        // Save current score to localStorage when pausing
        if (newIsPaused) {
            gameStore.set({
                ...gameStore.value,
                scores: {
                    ...gameStore.value.scores,
                    current: stopwatch.elapsed,
                },
            });
        }
    }, 100);

    return useMount(
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
                                    <Grid3x3 className="size-5 mb-0.5" />
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
                                        <span>
                                            Use keyboard <Kbd>1-9</Kbd> to fill a cell,{' '}
                                            <Kbd>Arrow</Kbd> keys to navigate and{' '}
                                            <Kbd>Delete</Kbd>,<Kbd>Backspace</Kbd> or{' '}
                                            <Kbd>0</Kbd> to clear a cell.
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 flex-wrap justify-between">
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
                                            title={`Total Solved in ${toTitleCase(selectedDifficulty)} Mode`}
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
                                <CircleGauge className="size-4 mb-0.5" />
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
                                <Shuffle className="size-4 mb-0.5" />
                                New Puzzle
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Flame className="size-4 mb-0.5" /> Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <Button
                                disabled={isSolved}
                                onClick={handlePauseGame}
                                variant="outline"
                            >
                                {isPaused ? (
                                    <Play className="size-4 mb-0.5" />
                                ) : (
                                    <Pause className="size-4 mb-0.5" />
                                )}
                                {isPaused ? 'Start' : 'Pause'}
                            </Button>

                            <Button onClick={handleReset} variant="destructive">
                                <RotateCcw className="size-4 mb-0.5" />
                                Reset
                            </Button>

                            <Button disabled={isSolved} onClick={handleSolve} variant="default">
                                <Zap className="size-4 mb-0.5" />
                                Show Solution
                            </Button>

                            <Button onClick={gameStore.remove} variant="destructive">
                                <BrushCleaning className="size-4 mb-0.5" />
                                Clear Records
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <BadgeQuestionMark className="size-4 mb-0.5" /> How to Play
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
