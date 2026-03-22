export type ChartType =
    | 'bar'
    | 'line'
    | 'area'
    | 'pie'
    | 'scatter'
    | 'radar'
    | 'composed'
    | 'treemap'
    | 'funnel';

export interface ChartDataPoint {
    [key: string]: string | number;
}

export interface ChartConfig {
    type: ChartType;
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    showGridlines: boolean;
    showLabels: boolean;
    showLegend: boolean;
    colorPalette: string[];
    margin?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}

export interface SeriesConfig {
    key: string;
    name: string;
    color?: string;
}

export interface ChartDataTransformed {
    data: ChartDataPoint[];
    series: SeriesConfig[];
    xAxisKey: string;
}
