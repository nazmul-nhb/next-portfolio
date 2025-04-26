'use client';

import { HeroUIProvider } from '@heroui/system';
import { ThemeProvider, type ThemeProviderProps } from 'next-themes';
import { useRouter } from 'next/navigation';
import { type ReactNode } from 'react';

import SyncCurrentUser from '@/app/sync';

export interface ProvidersProps {
	children: ReactNode;
	themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
	const router = useRouter();

	return (
		<HeroUIProvider navigate={router.push}>
			<SyncCurrentUser />
			<ThemeProvider {...themeProps}>{children}</ThemeProvider>
		</HeroUIProvider>
	);
}
