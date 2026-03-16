'use client';

import { isNumber } from 'nhb-toolbox';
import { Fragment } from 'react/jsx-runtime';
import { getAccuracyColor, type TypingMetrics } from '@/lib/tools/typing-test';
import { cn } from '@/lib/utils';

interface TypingStatsProps {
    metrics: TypingMetrics;
}

export default function TypingStats({ metrics }: TypingStatsProps) {
    return (
        <Fragment>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">WPM</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {isNumber(metrics.wpm) ? metrics.wpm : 0}
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
                {metrics.totalChars > 0 && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                            className="bg-emerald-500 dark:bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                            style={{
                                width: `${(metrics.correctChars / metrics.totalChars) * 100}%`,
                            }}
                        />
                    </div>
                )}
            </div>
        </Fragment>
    );
}
