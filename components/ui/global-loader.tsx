'use client';

import { CircularProgress } from '@heroui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function GlobalLoader() {
	const [loading, setLoading] = useState(false);
	const [progress, setProgress] = useState(0);
	const router = useRouter();

	useEffect(() => {
		const startTime = Date.now();
		let interval: NodeJS.Timeout;

		// Track route change start
		const handleRouteChangeStart = () => {
			setLoading(true);
			setProgress(0);
			interval = setInterval(() => {
				const elapsed = Date.now() - startTime;
				const duration = 1000; // Adjust this duration to match average route change time

				setProgress(Math.min((elapsed / duration) * 100, 100));
			}, 50); // Update progress every 50ms
		};

		// Track route change complete or error
		const handleRouteChangeComplete = () => {
			clearInterval(interval);
			setProgress(100);
			setTimeout(() => setLoading(false), 300); // Hide after a short delay
		};

		const handleRouteChangeError = () => {
			clearInterval(interval);
			setProgress(100);
			setTimeout(() => setLoading(false), 300); // Hide on error
		};

		router.events.on('routeChangeStart', handleRouteChangeStart);
		router.events.on('routeChangeComplete', handleRouteChangeComplete);
		router.events.on('routeChangeError', handleRouteChangeError);

		return () => {
			router.events.off('routeChangeStart', handleRouteChangeStart);
			router.events.off('routeChangeComplete', handleRouteChangeComplete);
			router.events.off('routeChangeError', handleRouteChangeError);
		};
	}, [router]);

	if (!loading) return null;

	return (
		<div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
			<CircularProgress
				aria-label="Loading..."
				color="warning"
				showValueLabel={true}
				size="lg"
				value={progress}
			/>
		</div>
	);
}
