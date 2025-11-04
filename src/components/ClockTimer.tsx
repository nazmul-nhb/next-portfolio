'use client';

import { Button } from '@/components/ui/button';
import { Clock, Copy, CopyCheck } from 'lucide-react';
import { formatTimer, useClock, useCopyText, useTimer } from 'nhb-hooks';
import { Chronos } from 'nhb-toolbox';
import { useEffect, useState } from 'react';

export default function ClockTimer() {
	const [mounted, setMounted] = useState(false);
	const { formatted, pause, isPaused, resume } = useClock({
		interval: 'frame',
		format: 'dd, mmm DD, yyyy - hh:mm:ss a',
	});

	const { copiedText, copyToClipboard } = useCopyText({
		onSuccess(msg) {
			console.log(msg);
		},
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
				<span className="text-red-600 animate-pulse">{formatTimer(duration)}</span>
			</span>
			<Button
				variant={isPaused ? 'default' : 'destructive'}
				className="font-bold"
				onClick={isPaused ? resume : pause}
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
