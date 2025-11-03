'use client';

import { Button } from '@/components/ui/button';
import { formatTimerUnit } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { useClock, useTimer } from 'nhb-hooks';
import { Chronos } from 'nhb-toolbox';
import { pluralizer } from 'nhb-toolbox/pluralizer';
import { useEffect, useState } from 'react';

export default function ClockTimer() {
	const [mounted, setMounted] = useState(false);
	const { formatted, pause, isPaused, resume } = useClock({
		interval: 'frame',
		format: 'dd, mmm DD, yyyy - hh:mm:ss a',
	});

	const duration = useTimer(new Chronos('2025-11-11').endOf('day'));

	useEffect(() => setMounted(true), []);

	if (!mounted) return null;

	return (
		<span className="w-full flex flex-col gap-4 font-semibold items-start">
			<span>
				Today is <span className="text-green-700 animate-bounce">{formatted}</span>
			</span>
			<span>
				Deadline Ends in{' '}
				<span className="text-red-600 animate-pulse">
					{formatTimerUnit(duration, { separator: ' · ', maxUnits: 6 })}
				</span>
			</span>
			<Button
				variant={isPaused ? 'default' : 'destructive'}
				className="font-bold"
				onClick={isPaused ? resume : pause}
			>
				{isPaused ? 'Resume ' : 'Pause '} Clock <Clock fontWeight={900} />
			</Button>
		</span>
	);
}
