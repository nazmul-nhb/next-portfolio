'use client';

import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Keyboard, RotateCcw, Timer, Zap } from 'lucide-react';
import { useMount, useStorage } from 'nhb-hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    calculateMetrics,
    getAccuracyColor,
    getRandomPassage,
    getWPMCategory,
    type TestDuration,
    type TypingMetrics,
} from '@/lib/typing-test';
import { cn } from '@/lib/utils';
import TypingDisplay from './TypingDisplay';
import TypingStats from './TypingStats';

type TestState = 'idle' | 'running' | 'completed';

interface TestSession {
    duration: TestDuration;
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

export default function TypingSpeedTest() {
    const sessionStore = useStorage<TestSession>({ key: 'nhb-typing-test-session' });

    // State
    const [testState, setTestState] = useState<TestState>('idle');
    const [duration, setDuration] = useState<TestDuration>(60);
    const [passage, setPassage] = useState(getRandomPassage());
    const [typed, setTyped] = useState('');
    const [timeLeft, setTimeLeft] = useState<number>(duration);
    const [metrics, setMetrics] = useState<TypingMetrics | null>(null);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval>>(null);

    // Load saved duration preference
    useEffect(() => {
        if (sessionStore.value) {
            setDuration(sessionStore.value.duration);
            setTimeLeft(sessionStore.value.duration);
        }
    }, [sessionStore.value]);

    // const result = useTimer(duration, 'second');

    // const res = formatTimer(result, {style: 'short', maxUnits: 1})

    // Timer effect
    useEffect(() => {
        if (testState !== 'running') return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setTestState('completed');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [testState]);

    // Calculate metrics when typed changes
    useEffect(() => {
        if (testState === 'running') {
            const currentMetrics = calculateMetrics(passage, typed, duration - timeLeft);
            setMetrics(currentMetrics);
        }
    }, [typed, testState, passage, duration, timeLeft]);

    const handleStart = useCallback(() => {
        setTestState('running');
        setTyped('');
        setMetrics(null);
        setTimeLeft(duration);
        sessionStore.set({ duration });

        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    }, [duration, sessionStore]);

    const handleReset = useCallback(() => {
        setTestState('idle');
        setPassage(getRandomPassage());
        setTyped('');
        setMetrics(null);
        setTimeLeft(duration);

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    }, [duration]);

    const completeMetrics = useMemo(() => {
        return calculateMetrics(passage, typed, duration);
    }, [passage, typed, duration]);

    return useMount(
        <motion.div
            animate="visible"
            className="space-y-8"
            initial="hidden"
            variants={containerVariants}
        >
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1fr_minmax(20rem,350px)]">
                {/* Main Content */}
                <motion.div className="space-y-6" variants={itemVariants}>
                    {/* Passage Display */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Keyboard className="size-5" />
                                Typing Area
                            </CardTitle>
                            <CardDescription>
                                {testState === 'idle'
                                    ? 'Select duration and click Start to begin'
                                    : testState === 'running'
                                      ? 'Type the text below as quickly and accurately as possible'
                                      : 'Test completed!'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Passage Preview */}
                            <div className="mb-6">
                                <TypingDisplay
                                    passage={passage}
                                    testState={testState}
                                    typed={typed}
                                />
                            </div>

                            {/* Text Input */}
                            {testState !== 'idle' && (
                                <div className="space-y-6">
                                    <Textarea
                                        autoFocus
                                        className={cn(
                                            'w-full p-3 rounded border resize-none',
                                            'bg-background border-input text-sm font-mono',
                                            'focus:outline-none focus:ring-2 focus:ring-primary',
                                            {
                                                'opacity-50 cursor-not-allowed':
                                                    testState === 'completed',
                                            }
                                        )}
                                        disabled={testState === 'completed'}
                                        onChange={(e) => setTyped(e.target.value)}
                                        placeholder="Start typing here..."
                                        ref={inputRef}
                                        rows={8}
                                        value={typed}
                                    />

                                    <Button
                                        disabled={testState === 'completed'}
                                        onClick={() => setTestState('completed')}
                                        type="button"
                                        variant={'destructive'}
                                    >
                                        Submit
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Sidebar */}
                <motion.div className="space-y-4" variants={itemVariants}>
                    {/* Timer & Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Timer className="size-4" />
                                Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {testState === 'idle' ? (
                                <>
                                    <div>
                                        <Label className="text-sm font-medium">Duration</Label>
                                        <Select
                                            onValueChange={(val) => {
                                                const newDuration = parseInt(
                                                    val,
                                                    10
                                                ) as TestDuration;
                                                setDuration(newDuration);
                                                setTimeLeft(newDuration);
                                            }}
                                            value={duration.toString()}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="30">30 seconds</SelectItem>
                                                <SelectItem value="60">1 minute</SelectItem>
                                                <SelectItem value="120">2 minutes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        className="w-full gap-2"
                                        onClick={handleStart}
                                        size="lg"
                                    >
                                        <Zap className="size-4" />
                                        Start Test
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center">
                                    <div
                                        className={cn(
                                            'text-5xl font-bold',
                                            timeLeft <= 10 && 'text-red-600 dark:text-red-400'
                                        )}
                                    >
                                        {timeLeft}s
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Time remaining
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Live Stats */}
                    {testState !== 'idle' && metrics && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Live Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <TypingStats metrics={metrics} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Results */}
                    {testState === 'completed' && (
                        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                            <CardHeader>
                                <CardTitle className="text-base">Results</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {completeMetrics.wpm}
                                    </p>
                                    <p className="text-xs text-muted-foreground">WPM</p>
                                </div>

                                <div>
                                    <p
                                        className={cn(
                                            'text-2xl font-bold',
                                            getAccuracyColor(completeMetrics.accuracy)
                                        )}
                                    >
                                        {completeMetrics.accuracy}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">Accuracy</p>
                                </div>

                                <div>
                                    <p className="text-sm">
                                        {getWPMCategory(completeMetrics.wpm)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Skill Level</p>
                                </div>

                                <Button
                                    className="w-full gap-2"
                                    onClick={handleReset}
                                    variant="outline"
                                >
                                    <RotateCcw className="size-4" />
                                    Try Again
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Controls */}
                    {testState !== 'idle' && testState !== 'completed' && (
                        <Card>
                            <CardContent className="pt-6">
                                <Button
                                    className="w-full gap-2"
                                    onClick={handleReset}
                                    variant="outline"
                                >
                                    <RotateCcw className="size-4" />
                                    Reset
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Info */}
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardHeader>
                            <CardTitle className="text-base">Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2 text-blue-900 dark:text-blue-100">
                            <p>• Accuracy matters more than speed</p>
                            <p>• Correct: Green, Incorrect: Red</p>
                            <p>• Timer starts on first keystroke</p>
                            <p>• WPM = (chars / 5) / minutes</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
