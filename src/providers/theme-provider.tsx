'use client';

import { ThemeProvider, type ThemeProviderProps } from 'next-themes';
import { Chronos } from 'nhb-toolbox';
import { banglaPlugin } from 'nhb-toolbox/plugins/banglaPlugin';
import { dayPartPlugin } from 'nhb-toolbox/plugins/dayPartPlugin';
import { durationPlugin } from 'nhb-toolbox/plugins/durationPlugin';
import { relativeTimePlugin } from 'nhb-toolbox/plugins/relativeTimePlugin';
import { seasonPlugin } from 'nhb-toolbox/plugins/seasonPlugin';
import { zodiacPlugin } from 'nhb-toolbox/plugins/zodiacPlugin';
import { timeZonePlugin } from 'nhb-toolbox/plugins/timeZonePlugin';

Chronos.register(banglaPlugin);
Chronos.register(seasonPlugin);
Chronos.register(zodiacPlugin);
Chronos.register(dayPartPlugin);
Chronos.register(durationPlugin);
Chronos.register(timeZonePlugin);
Chronos.register(relativeTimePlugin);

export function NextThemesProvider({ children, ...props }: ThemeProviderProps) {
    return <ThemeProvider {...props}>{children}</ThemeProvider>;
}
