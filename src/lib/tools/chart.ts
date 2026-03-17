import type { ChartDataPoint } from '@/types/chart';

export const COLOR_PALETTES = {
    pastel: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    vibrant: ['#FF1744', '#00BCD4', '#4CAF50', '#FFC107', '#FF9800'],
    ocean: ['#006BA6', '#0496FF', '#06A77D', '#00C1DE', '#FFB703'],
    sunset: ['#FF6B35', '#F7931E', '#FDB833', '#F37335', '#C1272D'],
    cool: ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'],
    minimal: ['#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD'],
    earth: ['#8B4513', '#D2691E', '#DEB887', '#CD853F', '#DAA520'],
} as const;

export type ColorPaletteName = keyof typeof COLOR_PALETTES;

export function detectAxisKeys(data: ChartDataPoint[]) {
    if (!data || data.length === 0) {
        return { xAxisKey: '', yAxisKeys: [] };
    }

    const firstItem = data[0];
    const keys = Object.keys(firstItem);

    // First non-numeric key becomes X-axis
    let xAxisKey = keys[0];
    const yAxisKeys: string[] = [];

    for (const key of keys) {
        const value = firstItem[key];
        if (typeof value === 'number' || !Number.isNaN(Number(value))) {
            yAxisKeys.push(key);
        } else if (yAxisKeys.length === 0) {
            xAxisKey = key;
        }
    }

    return {
        xAxisKey,
        yAxisKeys: yAxisKeys.length > 0 ? yAxisKeys : keys.slice(1),
    };
}

export function validateChartData(data: ChartDataPoint[], xKey: string, yKeys: string[]) {
    const errors: string[] = [];

    if (!data || data.length === 0) {
        errors.push('Data array is empty');
        return errors;
    }

    if (!xKey) {
        errors.push('X-axis key is required');
    }

    if (yKeys.length === 0) {
        errors.push('At least one Y-axis key is required');
    }

    // Check if keys exist in all data points
    for (let i = 0; i < data.length; i++) {
        const item = data[i];

        if (xKey && !(xKey in item)) {
            errors.push(`X-axis key "${xKey}" not found in item ${i + 1}`);
            break;
        }

        for (const yKey of yKeys) {
            if (!(yKey in item)) {
                errors.push(`Y-axis key "${yKey}" not found in item ${i + 1}`);
                break;
            }
        }
    }

    return errors;
}

export function transformChartData(data: ChartDataPoint[], xKey: string, yKeys: string[]) {
    const transformed = data.map((item) => {
        const newItem: ChartDataPoint = { [xKey]: item[xKey] };

        for (const yKey of yKeys) {
            newItem[yKey as string] = Number(item[yKey]) || 0;
        }

        return newItem;
    });

    return transformed;
}

export function exportChartAsImage(
    svgElement: SVGSVGElement,
    format: 'png' | 'svg',
    filename: string
) {
    if (format === 'svg') {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    } else if (format === 'png') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const rect = svgElement.getBoundingClientRect();

        canvas.width = rect.width;
        canvas.height = rect.height;

        if (!ctx) return;

        // Draw white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const svgString = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${filename}.png`;
                a.click();
                URL.revokeObjectURL(url);
            }, 'image/png');
        };
        img.src = `data:image/svg+xml;base64,${encodeURIComponent(svgString)}`;
    }
}
