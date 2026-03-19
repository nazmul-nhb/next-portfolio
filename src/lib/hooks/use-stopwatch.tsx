import { isBoolean } from 'nhb-toolbox';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface StopwatchOptions {
    /** Start automatically when mounted */
    autoStart?: boolean;

    /** Update interval in ms (UI refresh rate, not timing accuracy) */
    interval?: number;

    /** Initial elapsed time in milliseconds */
    initialTime?: number;

    /** External pause control */
    paused?: boolean;
}

interface StopwatchResult {
    /**
     * The elapsed time in milliseconds.
     *
     * This value increases while the stopwatch is running and
     * remains constant while paused.
     */
    elapsed: number;

    /**
     * Indicates whether the stopwatch is currently running.
     */
    isRunning: boolean;

    /**
     * Starts or resumes the stopwatch.
     *
     * If the stopwatch is already running, this function does nothing.
     */
    start: () => void;

    /**
     * Pauses the stopwatch.
     *
     * The current elapsed time is preserved and can be resumed
     * later using {@link start}.
     */
    pause: () => void;

    /**
     * Resets the stopwatch.
     *
     * Stops the timer and sets the elapsed time to the provided value.
     *
     * @param time - Optional starting time in milliseconds. Defaults to `0`.
     */
    reset: (time?: number) => void;

    /**
     * Toggles the running state of the stopwatch.
     *
     * If running → pauses the stopwatch.
     * If paused → starts or resumes it.
     */
    toggle: () => void;
}

/**
 * A high-precision stopwatch hook using timestamp based timing.
 * Accurate regardless of interval drift or tab throttling.
 */
export function useStopwatch(options: StopwatchOptions = {}): StopwatchResult {
    const { autoStart = false, interval = 100, initialTime = 0, paused = false } = options;

    const [elapsed, setElapsed] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(autoStart);

    const runningRef = useRef(autoStart);
    const startTimeRef = useRef<number | null>(null);
    const offsetRef = useRef(initialTime);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /**
     * Timer tick.
     */
    const tick = useCallback(() => {
        if (!runningRef.current || startTimeRef.current === null) return;

        setElapsed(offsetRef.current + (Date.now() - startTimeRef.current));
    }, []);

    /**
     * Start stopwatch.
     */
    const start = useCallback(() => {
        if (runningRef.current) return;

        runningRef.current = true;
        startTimeRef.current = Date.now();

        setIsRunning(true);
    }, []);

    /**
     * Pause stopwatch.
     */
    const pause = useCallback(() => {
        if (!runningRef.current) return;

        runningRef.current = false;

        if (startTimeRef.current !== null) {
            offsetRef.current += Date.now() - startTimeRef.current;
        }

        startTimeRef.current = null;

        setIsRunning(false);
    }, []);

    /**
     * Reset stopwatch.
     */
    const reset = useCallback((time = 0) => {
        runningRef.current = false;
        startTimeRef.current = null;
        offsetRef.current = time;

        setElapsed(time);
        setIsRunning(false);
    }, []);

    /**
     * Toggle running state.
     */
    const toggle = useCallback(() => {
        runningRef.current ? pause() : start();
    }, [pause, start]);

    /**
     * Interval lifecycle.
     */
    useEffect(() => {
        intervalRef.current = setInterval(tick, interval);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [interval, tick]);

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

    return useMemo(
        () => ({
            elapsed,
            isRunning,
            start,
            pause,
            reset,
            toggle,
        }),
        [elapsed, isRunning, start, pause, reset, toggle]
    );
}
