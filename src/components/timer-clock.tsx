'use client';

import { Clock, Copy, CopyCheck } from 'lucide-react';
import { formatTimer, useClock, useCopyText, useMount, useTimer } from 'nhb-hooks';
import { Chronos } from 'nhb-toolbox';
import { seasonPlugin } from 'nhb-toolbox/plugins/seasonPlugin';
import { timeZonePlugin } from 'nhb-toolbox/plugins/timeZonePlugin';
import { Button } from '@/components/ui/button';
import { useStorage } from '@/hooks/useStorage';

Chronos.register(timeZonePlugin);
Chronos.register(seasonPlugin);

export default function ClockTimer() {
    const { formatted, pause, isPaused, resume, time } = useClock({
        interval: 'frame',
        format: 'dd, mmm DD, yyyy · hh:mm:ss a',
    });

    const { copiedText, copyToClipboard } = useCopyText({
        onSuccess(msg) {
            console.log(msg);
        },
    });

    const duration = useTimer(new Chronos().endOf('month'));

    // const timeStorage = new WebStorage().set({ time: time.toDate() }, 'time');
    // const timerStorage = new WebStorage().set(formatTimer(duration), 'timer');

    const storage = useStorage({
        key: 'time',
        initialValue: time,
        serialize: (value) => {
            try {
                return value.toISOString();
            } catch {
                console.warn(`Cannot serialize data`);
            }
        },
        deserialize: (value) => {
            try {
                return new Chronos(value);
            } catch {
                console.warn(`Cannot deserialize date`);
            }
        },
    });

    return useMount(
        <span className="w-full flex flex-col gap-4 font-semibold items-start">
            <span>
                Today is <span className="text-green-700 animate-bounce">{formatted}</span>
            </span>
            <span>{time.season({ preset: 'vedic' })}</span>
            <span>
                Deadline Ends in{' '}
                <span className="text-red-600 animate-pulse">
                    {formatTimer(duration, { style: 'short', showZero: true })}
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

            <Button
                className="font-bold"
                onClick={() => storage.set(time.timeZone('Asia/Karachi'))}
                variant={'default'}
            >
                Set Time to LS : {time.toLocalISOString()}
            </Button>

            <Button
                className="font-bold"
                onClick={() => storage.remove()}
                variant={'destructive'}
            >
                Remove Time from LS : {storage.value?.toLocalISOString()}
            </Button>

            {/* <Button
                className="font-bold"
                onClick={() => timerStorage.set((duration), 'timer')}
                variant={'default'}
            >
                Set Timer to LS : {timerStorage.get('timer')}
            </Button> */}

            {/* <Button
                className="font-bold"
                onClick={() => timerStorage.remove('timer')}
                variant={'destructive'}
            >
                Remove Timer from LS : {timerStorage.get('timer')}
            </Button> */}
        </span>
    );
}
