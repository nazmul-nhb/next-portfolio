import { isBoolean, isNumber, parseMs } from 'nhb-toolbox';
import type { TimeWithUnit } from 'nhb-toolbox/date/types';
import type { Numeric } from 'nhb-toolbox/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface TimerOptions {
    /** Start automatically when mounted */
    autoStart?: boolean;

    /** Update interval in ms (UI refresh rate, not timing accuracy) */
    interval?: number;

    /** Initial remaining time in milliseconds */
    initialTime?: number;

    /** External pause control */
    paused?: boolean;
}

interface TimerResult {
    remaining: number;
    isRunning: boolean;
    pause: () => void;
    start: () => void;
    reset: (time?: number) => void;
    toggle: () => void;
}

export function useTimerMs(time: TimeWithUnit | Numeric, options?: TimerOptions): TimerResult {
    const { autoStart = false, interval = 100, initialTime, paused = false } = options ?? {};

    const now = useMemo(() => new Date(), []);

    const initialMs = useMemo(() => {
        const ms = parseMs(time);

        return isNumber(ms) ? ms : now.getTime();
    }, [time, now]);

    const [remainingMs, setRemainingMs] = useState<number>(initialTime || initialMs);
    const [isRunning, setIsRunning] = useState(autoStart);

    const runningRef = useRef(autoStart);

    const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /**
     * Timer tick.
     */
    const tick = useCallback(() => {
        //
    }, []);

    /**
     * Start stopwatch.
     */
    const start = useCallback(() => {
        //
    }, []);

    /**
     * Pause stopwatch.
     */
    const pause = useCallback(() => {
        //
    }, []);

    /**
     * Reset stopwatch.
     */
    const reset = useCallback((time = 0) => {
        //
    }, []);

    useEffect(() => {
        if (remainingMs <= 0) {
            queueMicrotask(() => setRemainingMs(0));
            return;
        }

        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - now.getTime();
            setRemainingMs(Math.max(initialMs - elapsed, 0));
        }, interval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [initialMs, remainingMs, now, interval]);

    /**
     * Toggle running state.
     */
    const toggle = useCallback(() => {
        runningRef.current ? pause() : start();
    }, [pause, start]);

    /**
     * External pause control.
     */
    useEffect(() => {
        if (!isBoolean(paused)) return;

        paused ? pause() : start();
    }, [paused, pause, start]);

    /**
     * Auto start (run once).
     */
    useEffect(() => {
        if (autoStart) start();
    }, [autoStart, start]);

    return useMemo(() => {
        return { remaining: remainingMs, isRunning, pause, reset, start, toggle };
    }, [remainingMs, isRunning, pause, reset, start, toggle]);
}
