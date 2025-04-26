'use client';

import { Button } from '@heroui/button';
import { useEffect } from 'react';

interface ErrorProps {
	error: Error;
	reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
	useEffect(() => console.error(error), [error]);

	return (
		<div>
			<h2>Something went wrong!</h2>
			<Button
				onPress={
					// Attempt to recover by trying to re-render the segment
					() => reset()
				}
			>
				Try again
			</Button>
		</div>
	);
}
