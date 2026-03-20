'use client';

import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import {
    ChartNoAxesCombined,
    Clipboard,
    Keyboard,
    LaptopMinimalCheck,
    Lightbulb,
    RotateCcw,
    Timer,
    Zap,
} from 'lucide-react';
import { useStopwatch, useStorage } from 'nhb-hooks';
import { parseMs } from 'nhb-toolbox';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CodeBlock from '@/components/misc/code-block';
import EmptyData from '@/components/misc/empty-data';
import SmartAlert from '@/components/misc/smart-alert';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    calculateMetrics,
    getAccuracyColor,
    getRandomPassage,
    getWPMCategory,
    type TestDuration,
    type TypingMetrics,
} from '@/lib/tools/typing-test';
import { cn } from '@/lib/utils';
import TypingDisplay from './TypingDisplay';
import TypingStats from './TypingStats';

type TestState = 'idle' | 'running' | 'completed';
type TimerMode = 'timer' | 'stopwatch';

interface TestSession {
    duration: TestDuration;
    mode: TimerMode;
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

/**
 * Format milliseconds to MM:SS format
 */
function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function TypingSpeedTest() {
    const sessionStore = useStorage<TestSession>({ key: 'nhb-typing-test' });

    const [testState, setTestState] = useState<TestState>('idle');
    const [timerMode, setTimerMode] = useState<TimerMode>('timer');
    const [duration, setDuration] = useState<TestDuration>(60);
    const [passage, setPassage] = useState(getRandomPassage());
    const [customText, setCustomText] = useState('');
    const [useCustomText, setUseCustomText] = useState(false);
    const [typed, setTyped] = useState('');
    const [timeLeft, setTimeLeft] = useState<number>(duration);
    const [metrics, setMetrics] = useState<TypingMetrics | null>(null);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval>>(null);

    // Stopwatch hook
    const stopwatch = useStopwatch();

    // Get effective passage (custom or random)
    const effectivePassage = useCustomText && customText.trim() ? customText : passage;

    // Load saved preferences
    useEffect(() => {
        if (sessionStore.value) {
            setDuration(sessionStore.value.duration);
            setTimeLeft(sessionStore.value.duration);
            setTimerMode(sessionStore.value.mode || 'timer');
        }
    }, [sessionStore.value]);

    // Timer effect (for timer mode only)
    useEffect(() => {
        if (testState !== 'running' || timerMode !== 'timer') return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setTestState('completed');
                    stopwatch.pause();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [testState, timerMode, stopwatch.pause]);

    // Calculate metrics when typed changes
    useEffect(() => {
        if (testState === 'running') {
            const elapsedSeconds =
                timerMode === 'stopwatch' ? stopwatch.elapsed / 1000 : duration - timeLeft;

            const currentMetrics = calculateMetrics(effectivePassage, typed, elapsedSeconds);
            setMetrics(currentMetrics);
        }
    }, [typed, testState, effectivePassage, duration, timeLeft, timerMode, stopwatch.elapsed]);

    const handleStart = useCallback(() => {
        setTestState('running');
        setTyped('');
        setMetrics(null);

        if (timerMode === 'timer') {
            setTimeLeft(duration);
        } else {
            stopwatch.reset();
            stopwatch.start();
        }

        sessionStore.set({ duration, mode: timerMode });

        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    }, [duration, timerMode, sessionStore, stopwatch]);

    const handleReset = useCallback(() => {
        setTestState('idle');
        setPassage(getRandomPassage());
        setTyped('');
        setMetrics(null);
        setTimeLeft(duration);
        stopwatch.reset();
        stopwatch.pause();

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    }, [duration, stopwatch]);

    const handleComplete = useCallback(() => {
        setTestState('completed');
        stopwatch.pause();
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    }, [stopwatch]);

    // Calculate final metrics
    const elapsedSeconds =
        timerMode === 'stopwatch' ? stopwatch.elapsed / 1000 : duration - timeLeft;

    const completeMetrics = useMemo(() => {
        // Ensure we have some elapsed time
        const finalElapsed = Math.max(1, elapsedSeconds);
        return calculateMetrics(effectivePassage, typed, finalElapsed);
    }, [effectivePassage, typed, elapsedSeconds]);

    return (
        <motion.div
            animate="visible"
            className="space-y-8"
            initial="hidden"
            variants={containerVariants}
        >
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                {/* Left Panel - Settings & Input */}
                <motion.div className="space-y-4" variants={itemVariants}>
                    {/* Passage Selection & Text Input */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clipboard className="size-4.5 mb-1" />
                                {testState === 'idle' ? 'Choose Text' : 'Passage'}
                            </CardTitle>
                            <CardDescription>
                                {useCustomText
                                    ? 'Using your custom text'
                                    : 'Using random passage'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {testState === 'idle' && (
                                <Tabs
                                    onValueChange={(val) => {
                                        setUseCustomText(val === 'custom');
                                        setCustomText('');
                                    }}
                                    value={useCustomText ? 'custom' : 'random'}
                                >
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="random">Random</TabsTrigger>
                                        <TabsTrigger value="custom">Custom</TabsTrigger>
                                    </TabsList>

                                    <TabsContent className="space-y-3" value="random">
                                        <SmartAlert description="A random passage will be provided for the test." />
                                    </TabsContent>

                                    <TabsContent className="space-y-3" value="custom">
                                        <Textarea
                                            className="w-full min-h-24 text-sm font-cascadia max-h-40 overflow-y-auto custom-scroll"
                                            onChange={(e) => setCustomText(e.target.value)}
                                            placeholder="Paste or type your custom text here..."
                                            value={customText}
                                        />
                                        {customText.trim() && (
                                            <p className="text-xs text-muted-foreground">
                                                {customText.length} characters
                                            </p>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            )}

                            {testState !== 'idle' && (
                                <div className="space-y-2">
                                    <TypingDisplay
                                        passage={effectivePassage}
                                        testState={testState}
                                        typed={typed}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Test Settings */}
                    {testState === 'idle' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Timer className="size-4 mb-1" />
                                    Mode & Duration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Timer Mode</Label>
                                    <Select
                                        onValueChange={(val) => setTimerMode(val as TimerMode)}
                                        value={timerMode}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="timer">
                                                Timer (Fixed Duration)
                                            </SelectItem>
                                            <SelectItem value="stopwatch">
                                                Stopwatch (No Limit)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {timerMode === 'timer' && (
                                    <div>
                                        <Label className="text-sm font-medium">Duration</Label>
                                        <Select
                                            onValueChange={(val) => {
                                                const newDuration = +val as TestDuration;
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
                                )}

                                <Button
                                    className="w-full gap-2"
                                    onClick={handleStart}
                                    size="lg"
                                >
                                    <Zap className="size-4" />
                                    Start Test
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Text Input Area */}
                    {testState !== 'idle' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Keyboard className="size-5" />
                                    Type Here
                                </CardTitle>
                                <CardDescription>
                                    {testState === 'running'
                                        ? 'Type as quickly and accurately as possible'
                                        : 'Test completed!'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Textarea
                                    autoFocus
                                    className={cn(
                                        'w-full text-sm font-cascadia min-h-24 max-h-40 overflow-y-auto custom-scroll',
                                        {
                                            'opacity-50 cursor-not-allowed':
                                                testState === 'completed',
                                        }
                                    )}
                                    disabled={testState === 'completed'}
                                    onChange={(e) => setTyped(e.target.value)}
                                    placeholder="Start typing here..."
                                    ref={inputRef}
                                    rows={10}
                                    value={typed}
                                />

                                {testState === 'running' && (
                                    <div className="flex gap-2">
                                        <Button
                                            className="flex-1 gap-2"
                                            onClick={handleComplete}
                                            size="sm"
                                            variant="default"
                                        >
                                            <Zap className="size-3" />
                                            Finish Test
                                        </Button>
                                        <Button
                                            className="flex-1 gap-2"
                                            onClick={handleReset}
                                            size="sm"
                                            variant="outline"
                                        >
                                            <RotateCcw className="size-3" />
                                            Reset
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Tips */}
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Lightbulb className="size-4 mb-1" /> Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2 text-blue-900 dark:text-blue-100">
                            <ul className="ml-8 list-item list-disc space-y-1">
                                <li>Accuracy matters more than speed</li>
                                <li>Green = Correct, Red = Incorrect</li>
                                <li>WPM = (chars ÷ 5) ÷ minutes</li>
                                <li>Focus on consistency</li>
                            </ul>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Panel - Timer & Results */}
                <motion.div className="space-y-4" variants={itemVariants}>
                    {/* Timer / Stopwatch Display */}
                    {testState !== 'idle' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Timer className="size-4 mb-1" />
                                    {timerMode === 'timer' ? 'Time Left' : 'Elapsed Time'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-center">
                                    <CodeBlock
                                        className={cn(
                                            'text-4xl md:text-5xl font-digital font-bold text-center px-4 pb-4',
                                            timerMode === 'timer' &&
                                                timeLeft <= 10 &&
                                                'text-red-600 dark:text-red-400'
                                        )}
                                    >
                                        {timerMode === 'timer'
                                            ? formatTime(parseMs(timeLeft))
                                            : formatTime(stopwatch.elapsed)}
                                    </CodeBlock>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Live Stats */}
                    {testState === 'running' && metrics && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ChartNoAxesCombined className="size-4 mb-1" /> Live Stats
                                </CardTitle>
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
                                <CardTitle className="text-base flex items-center gap-2">
                                    <LaptopMinimalCheck className="size-4" />
                                    Results
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <CodeBlock className="text-3xl font-digital font-bold text-emerald-600 dark:text-emerald-400 text-center py-2 mb-1">
                                        {completeMetrics.wpm}
                                    </CodeBlock>
                                    <p className="text-xs text-muted-foreground text-center">
                                        WPM
                                    </p>
                                </div>

                                <div>
                                    <p
                                        className={cn(
                                            'text-2xl font-bold text-center',
                                            getAccuracyColor(completeMetrics.accuracy)
                                        )}
                                    >
                                        {completeMetrics.accuracy}%
                                    </p>
                                    <p className="text-xs text-muted-foreground text-center">
                                        Accuracy
                                    </p>
                                </div>

                                <div className="pt-2 border-t">
                                    <p className="text-sm font-medium text-center">
                                        {getWPMCategory(completeMetrics.wpm)}
                                    </p>
                                    <p className="text-xs text-muted-foreground text-center">
                                        Skill Level
                                    </p>
                                </div>

                                <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                                    <div className="text-center p-2 rounded bg-muted">
                                        <p className="font-semibold">
                                            {completeMetrics.correctChars}
                                        </p>
                                        <p className="text-muted-foreground">Correct</p>
                                    </div>
                                    <div className="text-center p-2 rounded bg-muted">
                                        <p className="font-semibold text-red-600 dark:text-red-400">
                                            {completeMetrics.errors}
                                        </p>
                                        <p className="text-muted-foreground">Errors</p>
                                    </div>
                                </div>

                                <Button
                                    className="w-full gap-2"
                                    onClick={handleReset}
                                    variant="default"
                                >
                                    <RotateCcw className="size-4" />
                                    Try Again
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {testState === 'idle' && (
                        <EmptyData
                            description="You will see the live result here as soon as you start your test."
                            Icon={Zap}
                            title="Start Your Test"
                        />
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
