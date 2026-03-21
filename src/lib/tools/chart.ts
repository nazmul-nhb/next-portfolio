import { isNumber } from 'nhb-toolbox';
import type { ChartDataPoint } from '@/types/chart';

const EXPORT_MIN_WIDTH = 800;

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
        if (isNumber(value) || !Number.isNaN(Number(value))) {
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
    const getNumericAttr = (value: string | null) => {
        if (!value) return undefined;
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        if (trimmed.endsWith('%')) return undefined;
        const parsed = Number.parseFloat(trimmed);
        return Number.isFinite(parsed) ? parsed : undefined;
    };

    const bounds = svgElement.getBoundingClientRect();
    const attrWidth = getNumericAttr(svgElement.getAttribute('width'));
    const attrHeight = getNumericAttr(svgElement.getAttribute('height'));

    const fallbackViewBox = svgElement.viewBox?.baseVal;
    const viewBoxWidth = fallbackViewBox?.width || undefined;
    const viewBoxHeight = fallbackViewBox?.height || undefined;

    const width = Math.round(bounds.width) || attrWidth || viewBoxWidth || EXPORT_MIN_WIDTH;
    const height = Math.round(bounds.height) || attrHeight || viewBoxHeight || 600;

    if (!width || !height) {
        throw new Error('Unable to determine chart size for export');
    }

    const exportWidth = Math.max(width, EXPORT_MIN_WIDTH);
    const exportScale = exportWidth / width;
    const exportHeight = Math.round(height * exportScale);

    const svgForExport = svgElement.cloneNode(true) as SVGSVGElement;
    svgForExport.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgForExport.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    if (!svgForExport.getAttribute('viewBox')) {
        svgForExport.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }
    svgForExport.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svgForExport.setAttribute('width', `${exportWidth}`);
    svgForExport.setAttribute('height', `${exportHeight}`);

    const svgString = new XMLSerializer().serializeToString(svgForExport);

    if (format === 'svg') {
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

        if (!ctx) return;

        const scale = window.devicePixelRatio || 1;

        canvas.width = Math.ceil(exportWidth * scale);
        canvas.height = Math.ceil(exportHeight * scale);

        ctx.setTransform(scale, 0, 0, scale, 0, 0);

        // Background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, exportWidth, exportHeight);

        const img = new Image();

        img.onload = () => {
            ctx.drawImage(img, 0, 0, exportWidth, exportHeight);

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

        img.onerror = () => {
            // No-op: the caller will surface the export failure.
        };

        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
    }
}

export function getSvgExportScore(svgElement: SVGSVGElement) {
    const getNumericAttr = (value: string | null) => {
        if (!value) return undefined;
        const trimmed = value.trim();
        if (!trimmed || trimmed.endsWith('%')) return undefined;
        const parsed = Number.parseFloat(trimmed);
        return Number.isFinite(parsed) ? parsed : undefined;
    };

    const bounds = svgElement.getBoundingClientRect();
    const attrWidth = getNumericAttr(svgElement.getAttribute('width'));
    const attrHeight = getNumericAttr(svgElement.getAttribute('height'));
    const viewBox = svgElement.viewBox?.baseVal;

    const width = Math.round(bounds.width) || attrWidth || viewBox?.width || 0;
    const height = Math.round(bounds.height) || attrHeight || viewBox?.height || 0;

    return {
        width,
        height,
        area: width * height,
    };
}
