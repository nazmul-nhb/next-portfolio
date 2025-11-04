'use client';

import FloatingButton from '@/components/ui/floating-button';
import { useMount } from '@/hooks/useMount';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';

export default function ThemeToggler() {
	const { setTheme, theme } = useTheme();

	const toggleTheme = useCallback(() => {
		if (theme) {
			setTheme(theme === 'dark' ? 'light' : 'dark');
		}
	}, [theme]);

	return useMount(
		<FloatingButton onClick={toggleTheme} icon={theme === 'dark' ? Sun : Moon} />
	);
}
