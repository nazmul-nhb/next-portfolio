import { clsx, type ClassValue } from 'clsx';
import type { DurationKey, DurationOptions, TimeDuration } from 'nhb-toolbox/date/types';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatTimerUnit(
	duration: TimeDuration,
	options?: Omit<DurationOptions, 'toTime' | 'absolute'>
): string {
	const { maxUnits = 7, separator = ', ', style = 'full', showZero = false } = options ?? {};

	const _formatUnit = (unit: DurationKey, value: number): string => {
		const $unit = Math.abs(value) === 1 ? unit.slice(0, -1) : unit;

		return `${value} ${$unit}`;
	};

	const parts = (Object.entries(duration).slice(0, 6) as Array<[DurationKey, number]>)
		.filter(([_, value]) => showZero || Math.abs(value) > 0)
		.slice(0, maxUnits)
		.map(([unit, value]) => _formatUnit(unit, value));

	return parts.length ? parts.join(separator) : style === 'short' ? '0s' : '0 seconds';
}
