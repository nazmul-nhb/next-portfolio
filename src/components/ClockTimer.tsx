'use client';

import { useClock, useTimer } from 'nhb-hooks';
import { pluralizer } from 'nhb-toolbox/pluralizer';
import { useEffect, useState } from 'react';

export default function ClockTimer() {
	const [mounted, setMounted] = useState(false);
	const { formatted } = useClock({
		interval: 'frame',
		format: 'dd, mmm DD, yyyy - hh:mm:ss a',
	});

	const { days, hours, minutes, seconds } = useTimer('2025-11-11T23:59:59.999+0600');

	useEffect(() => setMounted(true), []);

	if (!mounted) return null;

	return (
		<span className="flex flex-col gap-4 font-semibold">
			<span>
				Today is <span className="text-green-700 animate-bounce">{formatted}</span>
			</span>
			<span>
				Deadline Ends in{' '}
				<span className="text-red-700 animate-pulse">
					{pluralizer.pluralize('day', { count: days, inclusive: true })},{' '}
					{pluralizer.pluralize('hour', { count: hours, inclusive: true })},{' '}
					{pluralizer.pluralize('minute', { count: minutes, inclusive: true })},{' '}
					{pluralizer.pluralize('second', { count: seconds, inclusive: true })}
				</span>
			</span>
		</span>
	);
}
