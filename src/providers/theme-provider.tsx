'use client';

import { ThemeProvider, type ThemeProviderProps } from 'next-themes';
import { Chronos } from 'nhb-toolbox';
import { banglaPlugin } from 'nhb-toolbox/plugins/banglaPlugin';
import { relativeTimePlugin } from 'nhb-toolbox/plugins/relativeTimePlugin';
import { seasonPlugin } from 'nhb-toolbox/plugins/seasonPlugin';

Chronos.register(banglaPlugin);
Chronos.register(relativeTimePlugin);
Chronos.register(seasonPlugin);

export function NextThemesProvider({ children, ...props }: ThemeProviderProps) {
    return <ThemeProvider {...props}>{children}</ThemeProvider>;
}
