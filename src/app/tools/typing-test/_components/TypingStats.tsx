'use client';

import { getAccuracyColor, type TypingMetrics } from '@/lib/typing-test';
import { cn } from '@/lib/utils';

interface TypingStatsProps {
    metrics: TypingMetrics;
}

export default function TypingStats({ metrics }: TypingStatsProps) {
    return (
        <>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">WPM</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {metrics.wpm}
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Accuracy</span>
                    <span
                        className={cn('text-2xl font-bold', getAccuracyColor(metrics.accuracy))}
                    >
                        {metrics.accuracy}%
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Errors</span>
                    <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                        {metrics.errors}
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Characters</span>
                    <span className="text-sm text-muted-foreground">
                        {metrics.correctChars}/{metrics.totalChars}
                    </span>
                </div>
            </div>
        </>
    );
}
