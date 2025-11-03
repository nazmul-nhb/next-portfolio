import ClockTimer from '@/components/ClockTimer';

export default function Home() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
				<div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
					<h1 className="max-w-full text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
						Demo Current Time & Timer
					</h1>
					<p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
						<ClockTimer />
					</p>
				</div>
			</main>
		</div>
	);
}
