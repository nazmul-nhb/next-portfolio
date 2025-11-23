'use client';

import { Clock, Copy, CopyCheck } from 'lucide-react';
import { formatTimer, useClock, useCopyText, useMount, useStorage, useTimer } from 'nhb-hooks';
import { Chronos, isArray } from 'nhb-toolbox';
import { seasonPlugin } from 'nhb-toolbox/plugins/seasonPlugin';
import { timeZonePlugin } from 'nhb-toolbox/plugins/timeZonePlugin';
import { Button } from '@/components/ui/button';

Chronos.register(timeZonePlugin);
Chronos.register(seasonPlugin);

export default function ClockTimer() {
    const { formatted, pause, isPaused, resume, time } = useClock({
        interval: 'frame',
        timeZone: 'UTC+06:00',
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

    const ts = useStorage<Chronos>({
        key: 'time',
        serialize: (value) => {
            return value.toISOString();
        },
        deserialize: (value) => {
            return new Chronos(value).timeZone('Asia/Dhaka');
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

            <Button className="font-bold" onClick={() => ts.set(time)} variant={'default'}>
                Set Time to LS : {time.formatStrict('dd, mmm D, yyyy - HH:mm:ss:mss')} (
                {isArray(time.timeZoneId) ? time.timeZoneId.join(', ') : time.timeZoneId})
            </Button>

            <Button className="font-bold" onClick={() => ts.remove()} variant={'destructive'}>
                Remove Time from LS : {ts.value?.formatStrict('dd, mmm D, yyyy - HH:mm:ss:mss')}{' '}
                (
                {isArray(ts.value?.timeZoneId)
                    ? ts.value?.timeZoneId.join(', ')
                    : ts.value?.timeZoneId}
                )
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
