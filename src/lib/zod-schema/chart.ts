import { z } from 'zod';

export const chartDataPointSchema = z.record(z.string(), z.union([z.string(), z.number()]));

export const chartConfigSchema = z.object({
    type: z.enum([
        'bar',
        'line',
        'area',
        'pie',
        'scatter',
        'bubble',
        'radar',
        'composed',
        'treemap',
        'funnel',
    ] as const),
    title: z.string().optional(),
    xAxisLabel: z.string().optional(),
    yAxisLabel: z.string().optional(),
    showGridlines: z.boolean().default(true),
    showLabels: z.boolean().default(true),
    showLegend: z.boolean().default(true),
    colorPalette: z.array(z.string()).min(1),
    margin: z
        .object({
            top: z.number().nonnegative(),
            right: z.number().nonnegative(),
            bottom: z.number().nonnegative(),
            left: z.number().nonnegative(),
        })
        .optional(),
});

export const chartDataInputSchema = z.object({
    rawJson: z.string().refine(
        (val) => {
            if (!val.trim()) return false;
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) && parsed.length > 0;
            } catch {
                return false;
            }
        },
        { message: 'Must be valid JSON array with at least one item' }
    ),
    xAxisKey: z.string().min(1, 'X-axis key is required'),
    yAxisKeys: z.array(z.string()).min(1, 'At least one Y-axis key is required'),
});

export type ChartDataInput = z.infer<typeof chartDataInputSchema>;
export type ChartConfig = z.infer<typeof chartConfigSchema>;
export type ChartDataPoint = z.infer<typeof chartDataPointSchema>;
