import { isBoolean, isNumber, parseMSec } from 'nhb-toolbox';
import type { TimeWithUnit } from 'nhb-toolbox/date/types';
import type { Numeric } from 'nhb-toolbox/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface TimerOptions {
    /**
     * Start the countdown automatically when the hook mounts.
     *
     * @default false
     */
    autoStart?: boolean;

    /**
     * Update interval in milliseconds.
     *
     * This controls how often the UI is refreshed, not the actual countdown accuracy.
     *
     * @default 100
     */
    interval?: number;

    /**
     * Initial remaining time in milliseconds.
     *
     * Use this when you want to resume from a precomputed value instead of deriving the starting point from `time`.
     */
    initialRemainingMs?: number;

    /**
     * External pause control.
     *
     * When `false`, the timer will start or resume. When `true`, the timer pauses and preserves the current remaining time.
     *
     * @default false
     */
    paused?: boolean;
}

export interface TimerResult {
    /**
     * Remaining countdown time in milliseconds.
     */
    remaining: number;

    /**
     * Indicates whether the timer is currently running.
     */
    isRunning: boolean;

    /**
     * Starts or resumes the countdown.
     *
     * If the timer is already running, this function does nothing.
     */
    start: () => void;

    /**
     * Pauses the countdown.
     *
     * The current remaining time is preserved and can be resumed later with
     * {@link start}.
     */
    pause: () => void;

    /**
     * Resets the timer.
     *
     * Stops the countdown and sets the remaining time to the provided value.
     * When no value is passed, the timer resets to the initial countdown value resolved from `time` or `initialRemainingMs`.
     *
     * @param time - Optional remaining time in milliseconds.
     */
    reset: (time?: number) => void;

    /**
     * Toggles the running state of the timer.
     *
     * If running, pauses the timer. If paused, starts or resumes it.
     */
    toggle: () => void;
}

/**
 * * Countdown timer hook with millisecond precision.
 *
 * @param time
 * `time` is parsed with {@link https://toolbox.nazmul-nhb.dev/docs/utilities/date/parse-time#parsemsec parseMSec} from `nhb-toolbox`.
 * Numeric values are interpreted as seconds, not milliseconds, so `useTimerMs(5)` counts down from `5000` milliseconds.
 * If you already have a millisecond value, pass it as a unit string such as `'1500ms'` or `'2s'` to keep the intent explicit.
 *
 * Invalid input resolves to `0` milliseconds after normalization.
 * @param options Options to control the timer.
 * @returns
 */
export function useTimerMs(time: TimeWithUnit | Numeric, options?: TimerOptions): TimerResult {
    const {
        autoStart = false,
        interval = 100,
        initialRemainingMs,
        paused = false,
    } = options || {};

    const initialMs = useMemo(() => {
        const parsedMs = parseMSec(time);

        return isNumber(parsedMs) ? Math.max(parsedMs, 0) : 0;
    }, [time]);

    const resolvedInitialMs = useMemo(() => {
        const ms = initialRemainingMs ?? initialMs;

        return isNumber(ms) ? Math.max(ms, 0) : 0;
    }, [initialMs, initialRemainingMs]);

    const [remainingMs, setRemainingMs] = useState(resolvedInitialMs);
    const [isRunning, setIsRunning] = useState(autoStart);

    const runningRef = useRef(autoStart);
    const deadlineRef = useRef<number | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /**
     * Clear the active interval, if any.
     */
    const clearTimer = useCallback(() => {
        if (!intervalRef.current) return;

        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }, []);

    /**
     * Keep the remaining time in sync with the current deadline.
     */
    const tick = useCallback(() => {
        if (!runningRef.current || deadlineRef.current == null) return;

        const nextRemainingMs = Math.max(deadlineRef.current - Date.now(), 0);

        setRemainingMs(nextRemainingMs);

        if (nextRemainingMs === 0) {
            runningRef.current = false;
            deadlineRef.current = null;
            setIsRunning(false);
            clearTimer();
        }
    }, [clearTimer]);

    /**
     * Start timer.
     */
    const start = useCallback(() => {
        if (runningRef.current) return;

        if (remainingMs <= 0) {
            runningRef.current = false;
            deadlineRef.current = null;
            setRemainingMs(0);
            setIsRunning(false);
            clearTimer();
            return;
        }

        runningRef.current = true;
        deadlineRef.current = Date.now() + remainingMs;
        setIsRunning(true);
    }, [clearTimer, remainingMs]);

    /**
     * Pause timer.
     */
    const pause = useCallback(() => {
        if (!runningRef.current) return;

        runningRef.current = false;
        deadlineRef.current = null;

        setIsRunning(false);
        clearTimer();
    }, [clearTimer]);

    /**
     * Reset timer.
     */
    const reset = useCallback(
        (time = resolvedInitialMs) => {
            runningRef.current = false;
            deadlineRef.current = null;

            const nextRemainingMs = Number.isFinite(time) ? Math.max(time, 0) : 0;

            setRemainingMs(nextRemainingMs);
            setIsRunning(false);
            clearTimer();
        },
        [clearTimer, resolvedInitialMs]
    );

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
        if (!isRunning) {
            clearTimer();
            return;
        }

        intervalRef.current = setInterval(tick, interval);

        return clearTimer;
    }, [clearTimer, interval, isRunning, tick]);

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
            remaining: remainingMs,
            isRunning,
            pause,
            reset,
            start,
            toggle,
        }),
        [remainingMs, isRunning, pause, reset, start, toggle]
    );
}
