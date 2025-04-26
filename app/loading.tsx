'use client';

import { CircularProgress } from '@heroui/react';
import { useEffect, useState } from 'react';

export default function RootLoading() {
	const [value, setValue] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setValue((v) => (v >= 100 ? 0 : v + 5));
		}, 500);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="flex items-center justify-center w-full">
			{/* <Spinner classNames={{ label: 'text-foreground mt-4' }} variant="wave" /> */}
			{/* <GlobalLoader /> */}
			<CircularProgress
				aria-label="Loading..."
				color="warning"
				showValueLabel={true}
				size="lg"
				value={value}
			/>
		</div>
	);
}
