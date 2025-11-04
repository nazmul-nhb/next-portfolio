'use client';

import { Clock, Copy, CopyCheck } from 'lucide-react';
import { formatTimer, useClock, useCopyText, useMount, useTimer } from 'nhb-hooks';
import { Button } from '@/components/ui/button';

export default function ClockTimer() {
    const { formatted, pause, isPaused, resume } = useClock({
        interval: 'frame',
        format: 'dd, mmm DD, yyyy · hh:mm:ss a',
    });

    const { copiedText, copyToClipboard } = useCopyText({
        onSuccess(msg) {
            console.log(msg);
        },
    });

    const duration = useTimer('2025-11-11T23:59:59.999+06:00');

    return useMount(
        <span className="w-full flex flex-col gap-4 font-semibold items-start">
            <span>
                Today is <span className="text-green-700 animate-bounce">{formatted}</span>
            </span>
            <span>
                Deadline Ends in{' '}
                <span className="text-red-600 animate-pulse">
                    {formatTimer(duration, { style: 'short' })}
                </span>
            </span>
            <Button
                className="font-bold"
                onClick={isPaused ? resume : pause}
                variant={isPaused ? 'default' : 'destructive'}
            >
                {isPaused ? 'Resume ' : 'Pause '} Clock <Clock fontWeight={900} />
            </Button>

            <Button
                // size={copiedText ? 'default' : 'icon'}
                onClick={() => copyToClipboard(formatted)}
            >
                {copiedText ? (
                    <>
                        {copiedText} <CopyCheck />
                    </>
                ) : (
                    <>
                        Copy Current Date <Copy />
                    </>
                )}
            </Button>
        </span>
    );
}
