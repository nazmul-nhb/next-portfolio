import { Spinner } from '@heroui/spinner';

export default function RootLoading() {
	return (
		<div className="flex items-center justify-center w-full">
			<Spinner classNames={{ label: 'text-foreground mt-4' }} variant="wave" />
		</div>
	);
}
