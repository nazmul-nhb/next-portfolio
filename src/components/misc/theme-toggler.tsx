'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMount } from 'nhb-hooks';
import { useCallback } from 'react';
import FloatingButton from '@/components/ui/floating-button';

export default function ThemeToggler() {
    const { setTheme, theme } = useTheme();

    const toggleTheme = useCallback(() => {
        if (theme) {
            setTheme(theme === 'dark' ? 'light' : 'dark');
        }
    }, [theme, setTheme]);

    return useMount(
        <FloatingButton icon={theme === 'dark' ? Sun : Moon} onClick={toggleTheme} />
    );
}
