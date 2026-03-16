'use client';

import { Text } from 'lucide-react';
import EmptyData from '@/components/misc/empty-data';
import { getCharacterStatus } from '@/lib/tools/typing-test';
import { cn } from '@/lib/utils';

interface TypingDisplayProps {
    passage: string;
    typed: string;
    testState: 'idle' | 'running' | 'completed';
}

export default function TypingDisplay({ passage, typed, testState }: TypingDisplayProps) {
    if (!passage) {
        return (
            <EmptyData
                description="Please provide a text or generate a random text!"
                Icon={Text}
                title="No text to display"
            />
        );
    }

    return (
        <div
            className={cn(
                'p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 font-cascadia text-sm leading-relaxed overflow-auto max-h-40 custom-scroll'
            )}
        >
            {passage?.split('').map((char, idx) => {
                const status = getCharacterStatus(passage, typed, idx);
                const isCurrentChar = idx === typed.length && testState === 'running';

                return (
                    <span
                        className={cn(
                            'transition-colors',
                            status === 'correct' &&
                                'bg-emerald-200 dark:bg-emerald-700 text-emerald-900 dark:text-emerald-100',
                            status === 'incorrect' &&
                                'bg-red-200 dark:bg-red-700 text-red-900 dark:text-red-100',
                            status === 'missing' && 'text-gray-400 dark:text-gray-600',
                            status === 'extra' &&
                                'bg-orange-200 dark:bg-orange-700 text-orange-900 dark:text-orange-100',
                            isCurrentChar &&
                                'bg-blue-500 dark:bg-blue-600 text-white animate-pulse'
                        )}
                        key={idx}
                    >
                        {char === '\n' ? '↵' : char}
                    </span>
                );
            })}
        </div>
    );
}
