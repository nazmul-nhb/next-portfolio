import { Color } from 'nhb-toolbox/color';
import type { Hex } from 'nhb-toolbox/colors/types';

const FALLBACK_FOREGROUND = '#FFFFFF';
const FALLBACK_DARK_FOREGROUND = '#111827';

export function getPhotoCardColorTokens(input: string) {
    try {
        const base = new Color(input as Hex);
        const whiteContrast = base.contrastRatio(FALLBACK_FOREGROUND);
        const darkContrast = base.contrastRatio(FALLBACK_DARK_FOREGROUND);
        const foreground =
            whiteContrast >= darkContrast ? FALLBACK_FOREGROUND : FALLBACK_DARK_FOREGROUND;

        return {
            base: base.hex,
            border: base.applyBrightness(8).hex,
            surface: base.applyOpacity(14).rgba,
            surfaceStrong: base.applyOpacity(22).rgba,
            foreground,
        };
    } catch {
        return {
            base: input,
            border: input,
            surface: 'rgba(99, 102, 241, 0.14)',
            surfaceStrong: 'rgba(99, 102, 241, 0.22)',
            foreground: FALLBACK_FOREGROUND,
        };
    }
}
