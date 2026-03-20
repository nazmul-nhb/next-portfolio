import { isBoolean } from 'nhb-toolbox';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface StopwatchOptions {
    /**
     * Start the stopwatch automatically when the hook mounts.
     *
     * @default false
     */
    autoStart?: boolean;

    /**
     * Update interval in milliseconds.
     *
     * This controls how often the UI is refreshed, not the actual stopwatch precision.
     *
     * @default 100
     */
    interval?: number;

    /**
     * Initial elapsed time in milliseconds.
     */
    initialTime?: number;

    /**
     * External pause control.
     *
     * When `false`, the stopwatch starts or resumes. When `true`, the stopwatch pauses and preserves the current elapsed time.
     *
     * @default false
     */
    paused?: boolean;
}

export interface StopwatchResult {
    /**
     * Elapsed time in milliseconds.
     *
     * This value increases while the stopwatch is running and remains constant while paused.
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
     * The current elapsed time is preserved and can be resumed later with {@link start}.
     */
    pause: () => void;

    /**
     * Resets the stopwatch.
     *
     * Stops the stopwatch and sets the elapsed time to the provided value.
     *
     * @param time - Optional elapsed time in milliseconds. Defaults to `0`.
     */
    reset: (time?: number) => void;

    /**
     * Toggles the running state of the stopwatch.
     *
     * If running, pauses the stopwatch. If paused, starts or resumes it.
     */
    toggle: () => void;
}

/**
 * High-precision stopwatch hook using timestamp-based timing.
 *
 * @remarks
 * - Uses `Date.now()` to calculate elapsed time, ensuring accuracy even if:
 *   - The render interval drifts
 *   - The browser throttles timers (e.g. background tabs)
 * - The `interval` option only controls UI update frequency, **not** timing precision
 * - Elapsed time is accumulated using an internal offset, allowing seamless pause/resume cycles
 *
 * @param options - Stopwatch configuration options
 *
 * @returns Stopwatch state and control methods
 *
 * @example
 * Basic usage
 * ```tsx
 * const { elapsed, start, pause } = useStopwatch();
 * ```
 *
 * @example
 * Auto start
 * ```tsx
 * const timer = useStopwatch({ autoStart: true });
 * ```
 *
 * @example
 * Controlled pause (external state)
 * ```tsx
 * const [paused, setPaused] = useState(false);
 *
 * const { elapsed } = useStopwatch({ paused });
 * ```
 *
 * @example
 * Custom update interval
 * ```tsx
 * const timer = useStopwatch({ interval: 50 });
 * ```
 *
 * @example
 * Reset with custom time
 * ```tsx
 * const { reset } = useStopwatch();
 *
 * reset(2000); // reset to 2 seconds
 * ```
 *
 * @example
 * Resume from existing elapsed time
 * ```tsx
 * const timer = useStopwatch({
 *   initialTime: 5000,
 * });
 * ```
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
