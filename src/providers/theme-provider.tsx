'use client';

import { ThemeProvider, type ThemeProviderProps } from 'next-themes';

export function NextThemesProvider({ children, ...props }: ThemeProviderProps) {
	return <ThemeProvider {...props}>{children}</ThemeProvider>;
}
