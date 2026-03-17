'use client';

import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { AlertCircle, Download, FileJson, ScanEye, Settings2, Trash2 } from 'lucide-react';
import { useMount } from 'nhb-hooks';
import { parseJSON } from 'nhb-toolbox';
import { Fragment, useCallback, useRef, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ComposedChart,
    Funnel,
    FunnelChart,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Sector,
    Tooltip,
    Trapezoid,
    Treemap,
    XAxis,
    YAxis,
} from 'recharts';
import { toast } from 'sonner';
import EmptyData from '@/components/misc/empty-data';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    COLOR_PALETTES,
    type ColorPaletteName,
    detectAxisKeys,
    exportChartAsImage,
    transformChartData,
    validateChartData,
} from '@/lib/tools/chart';
import type { ChartDataPoint, ChartType } from '@/types/chart';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3, ease: 'easeOut' },
    },
};

const CHART_TYPES: { value: ChartType; label: string }[] = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'area', label: 'Area Chart' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'scatter', label: 'Scatter Chart' },
    { value: 'bubble', label: 'Bubble Chart' },
    { value: 'radar', label: 'Radar Chart' },
    { value: 'composed', label: 'Composed (Bar + Line)' },
    { value: 'treemap', label: 'Treemap' },
    { value: 'funnel', label: 'Funnel' },
];

function getFillFromPayload(payload: unknown): string | undefined {
    if (!payload || typeof payload !== 'object') return undefined;
    const maybeFill = (payload as { fill?: unknown }).fill;
    return typeof maybeFill === 'string' ? maybeFill : undefined;
}

function ColoredPieSector(props: Record<string, unknown>) {
    const { payload, fill, ...sectorProps } = props as {
        payload?: unknown;
        fill?: unknown;
    } & Record<string, unknown>;

    const payloadFill = getFillFromPayload(payload);
    const resolvedFill = payloadFill ?? (typeof fill === 'string' ? fill : undefined);

    return <Sector {...sectorProps} fill={resolvedFill} />;
}

function ColoredFunnelTrapezoid(props: Record<string, unknown>) {
    const { payload, fill, ...trapezoidProps } = props as {
        payload?: unknown;
        fill?: unknown;
    } & Record<string, unknown>;

    const payloadFill = getFillFromPayload(payload);
    const resolvedFill = payloadFill ?? (typeof fill === 'string' ? fill : undefined);

    return <Trapezoid {...trapezoidProps} fill={resolvedFill} />;
}

function TreemapNodeContent(props: Record<string, unknown>) {
    const {
        x,
        y,
        width,
        height,
        depth,
        index,
        name,
        payload,
        fill: propFill,
    } = props as {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        depth?: number;
        index?: number;
        name?: string;
        payload?: unknown;
        fill?: unknown;
    };

    if (!width || !height || width <= 0 || height <= 0) return null;

    const payloadFill = getFillFromPayload(payload);
    const resolvedFill = payloadFill ?? (typeof propFill === 'string' ? propFill : '#8884d8');

    const showLabel = depth === 1 && width > 48 && height > 24;
    const label = typeof name === 'string' ? name : `${index ?? ''}`;

    return (
        <g>
            <rect fill={resolvedFill} height={height} stroke="#fff" width={width} x={x} y={y} />
            {showLabel ? (
                <text
                    fill="#fff"
                    fontSize={14}
                    pointerEvents="none"
                    x={(x ?? 0) + 6}
                    y={(y ?? 0) + 18}
                >
                    {label}
                </text>
            ) : null}
        </g>
    );
}

export default function ChartGenerator() {
    const [rawJson, setRawJson] = useState('');
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [xAxisKey, setXAxisKey] = useState('');
    const [yAxisKeys, setYAxisKeys] = useState<string[]>([]);
    const [chartType, setChartType] = useState<ChartType>('bar');
    const [colorPalette, setColorPalette] = useState<ColorPaletteName>('pastel');
    const [showGridlines, setShowGridlines] = useState(true);
    const [showLabels, setShowLabels] = useState(true);
    const [showLegend, setShowLegend] = useState(true);
    const [chartTitle, setChartTitle] = useState('');
    const [xAxisLabel, setXAxisLabel] = useState('');
    const [yAxisLabel, setYAxisLabel] = useState('');
    const [dataErrors, setDataErrors] = useState<string[]>([]);
    const chartRef = useRef<HTMLDivElement>(null);

    const handleJsonChange = useCallback((value: string) => {
        setRawJson(value);
        setDataErrors([]);

        if (!value.trim()) {
            setChartData([]);
            setXAxisKey('');
            setYAxisKeys([]);
            return;
        }

        try {
            const parsed = parseJSON<ChartDataPoint[]>(value);

            if (!Array.isArray(parsed)) {
                setDataErrors(['Data must be a JSON array']);
                setChartData([]);
                return;
            }

            setChartData(parsed);

            // Auto-detect axis keys
            const { xAxisKey: detectedX, yAxisKeys: detectedY } = detectAxisKeys(parsed);
            setXAxisKey(detectedX);
            setYAxisKeys(detectedY);

            // Validate
            const errors = validateChartData(parsed, detectedX, detectedY);
            if (errors.length > 0) {
                setDataErrors(errors);
            }
        } catch {
            setDataErrors(['Invalid JSON format']);
            setChartData([]);
        }
    }, []);

    const handleFileUpload = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    handleJsonChange(content);
                    toast.success('File uploaded successfully');
                } catch {
                    toast.error('Failed to read file');
                    setDataErrors(['Failed to read file']);
                }
            };
            reader.readAsText(file);
        },
        [handleJsonChange]
    );

    const handleClearData = () => {
        setRawJson('');
        setChartData([]);
        setXAxisKey('');
        setYAxisKeys([]);
        setDataErrors([]);
    };

    const handleExport = useCallback((format: 'png' | 'svg') => {
        const svgElement = chartRef.current?.querySelector('svg');
        if (!svgElement) {
            toast.error('Chart not found');
            return;
        }

        try {
            const filename = `chart-${Date.now()}`;
            exportChartAsImage(svgElement, format, filename);
            toast.success(`Chart exported as ${format.toUpperCase()}`);
        } catch {
            toast.error('Failed to export chart');
        }
    }, []);

    const hasValidData =
        chartData.length > 0 && xAxisKey && yAxisKeys.length > 0 && dataErrors.length === 0;

    const transformedData = hasValidData
        ? transformChartData(chartData, xAxisKey, yAxisKeys)
        : [];

    const colors = COLOR_PALETTES[colorPalette];

    // Common chart props
    const commonProps = {
        data: transformedData,
        margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    const renderChart = () => {
        if (!hasValidData) return null;

        switch (chartType) {
            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        {showGridlines && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis
                            dataKey={xAxisKey}
                            label={
                                xAxisLabel
                                    ? {
                                          value: xAxisLabel,
                                          position: 'insideBottomRight',
                                          offset: -5,
                                      }
                                    : undefined
                            }
                        />
                        <YAxis
                            label={
                                yAxisLabel
                                    ? { value: yAxisLabel, angle: -90, position: 'insideLeft' }
                                    : undefined
                            }
                        />
                        {showLegend && <Legend />}
                        <Tooltip />
                        {yAxisKeys.map((key, idx) => (
                            <Bar
                                dataKey={key}
                                fill={colors[idx % colors.length]}
                                key={key}
                                name={key}
                            />
                        ))}
                    </BarChart>
                );

            case 'line':
                return (
                    <LineChart {...commonProps}>
                        {showGridlines && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis
                            dataKey={xAxisKey}
                            label={
                                xAxisLabel
                                    ? {
                                          value: xAxisLabel,
                                          position: 'insideBottomRight',
                                          offset: -5,
                                      }
                                    : undefined
                            }
                        />
                        <YAxis
                            label={
                                yAxisLabel
                                    ? { value: yAxisLabel, angle: -90, position: 'insideLeft' }
                                    : undefined
                            }
                        />
                        {showLegend && <Legend />}
                        <Tooltip />
                        {yAxisKeys.map((key, idx) => (
                            <Line
                                dataKey={key}
                                isAnimationActive={true}
                                key={key}
                                name={key}
                                stroke={colors[idx % colors.length]}
                                type="monotone"
                            />
                        ))}
                    </LineChart>
                );

            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        {showGridlines && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis
                            dataKey={xAxisKey}
                            label={
                                xAxisLabel
                                    ? {
                                          value: xAxisLabel,
                                          position: 'insideBottomRight',
                                          offset: -5,
                                      }
                                    : undefined
                            }
                        />
                        <YAxis
                            label={
                                yAxisLabel
                                    ? { value: yAxisLabel, angle: -90, position: 'insideLeft' }
                                    : undefined
                            }
                        />
                        {showLegend && <Legend />}
                        <Tooltip />
                        {yAxisKeys.map((key, idx) => (
                            <Area
                                dataKey={key}
                                fill={colors[idx % colors.length]}
                                isAnimationActive={true}
                                key={key}
                                name={key}
                                opacity={0.6}
                                stroke={colors[idx % colors.length]}
                                type="monotone"
                            />
                        ))}
                    </AreaChart>
                );

            case 'pie': {
                const pieData = transformedData.map((item, idx) => ({
                    ...item,
                    fill: colors[idx % colors.length],
                }));

                return (
                    <PieChart {...commonProps}>
                        {showLegend && <Legend />}
                        <Tooltip />
                        <Pie
                            data={pieData}
                            dataKey={yAxisKeys[0]}
                            isAnimationActive={true}
                            label={showLabels}
                            nameKey={xAxisKey}
                            shape={<ColoredPieSector />}
                        />
                    </PieChart>
                );
            }

            case 'scatter':
                return (
                    <ScatterChart {...commonProps}>
                        {showGridlines && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis
                            dataKey={yAxisKeys[0]}
                            label={
                                xAxisLabel
                                    ? {
                                          value: xAxisLabel,
                                          position: 'insideBottomRight',
                                          offset: -5,
                                      }
                                    : undefined
                            }
                            name={yAxisKeys[0]}
                        />
                        <YAxis
                            dataKey={yAxisKeys[1] || yAxisKeys[0]}
                            label={
                                yAxisLabel
                                    ? { value: yAxisLabel, angle: -90, position: 'insideLeft' }
                                    : undefined
                            }
                            name={yAxisKeys[1] || yAxisKeys[0]}
                        />
                        {showLegend && <Legend />}
                        <Tooltip />
                        <Scatter
                            data={transformedData}
                            fill={colors[0]}
                            isAnimationActive={true}
                            name={xAxisKey}
                        />
                    </ScatterChart>
                );

            case 'radar':
                return (
                    <RadarChart {...commonProps}>
                        <Radar
                            dataKey={yAxisKeys[0]}
                            fill={colors[0]}
                            fillOpacity={0.6}
                            isAnimationActive={true}
                            name={yAxisKeys[0]}
                            stroke={colors[0]}
                        />
                        {showLegend && <Legend />}
                        <Tooltip />
                    </RadarChart>
                );

            case 'composed':
                return (
                    <ComposedChart {...commonProps}>
                        {showGridlines && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis
                            dataKey={xAxisKey}
                            label={
                                xAxisLabel
                                    ? {
                                          value: xAxisLabel,
                                          position: 'insideBottomRight',
                                          offset: -5,
                                      }
                                    : undefined
                            }
                        />
                        <YAxis
                            label={
                                yAxisLabel
                                    ? { value: yAxisLabel, angle: -90, position: 'insideLeft' }
                                    : undefined
                            }
                        />
                        {showLegend && <Legend />}
                        <Tooltip />
                        {yAxisKeys.map((key, idx) => {
                            const barOrLine = idx === 0 ? 'bar' : 'line';
                            if (barOrLine === 'bar') {
                                return (
                                    <Bar
                                        dataKey={key}
                                        fill={colors[idx % colors.length]}
                                        key={key}
                                        name={key}
                                    />
                                );
                            }
                            return (
                                <Line
                                    dataKey={key}
                                    isAnimationActive={true}
                                    key={key}
                                    name={key}
                                    stroke={colors[idx % colors.length]}
                                    type="monotone"
                                />
                            );
                        })}
                    </ComposedChart>
                );

            case 'treemap': {
                const treemapData = transformedData.map((item, idx) => ({
                    ...item,
                    fill: colors[idx % colors.length],
                }));

                return (
                    <Treemap
                        content={<TreemapNodeContent />}
                        data={treemapData}
                        dataKey={yAxisKeys[0]}
                        fill={colors[0]}
                        isAnimationActive={true}
                        stroke="#fff"
                    />
                );
            }

            case 'funnel': {
                const funnelData = transformedData.map((item, idx) => ({
                    ...item,
                    fill: colors[idx % colors.length],
                }));

                return (
                    <FunnelChart {...commonProps}>
                        {showLegend && <Legend />}
                        <Tooltip />
                        <Funnel
                            data={funnelData}
                            dataKey={yAxisKeys[0]}
                            isAnimationActive={true}
                            nameKey={xAxisKey}
                            shape={<ColoredFunnelTrapezoid />}
                        />
                    </FunnelChart>
                );
            }

            default:
                return null;
        }
    };

    return useMount(
        <motion.div
            animate="visible"
            className="space-y-8"
            initial="hidden"
            variants={containerVariants}
        >
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                {/* Input and Controls Section */}
                <div className="space-y-4">
                    {/* JSON Input */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileJson className="size-5" />
                                    JSON Data Input
                                </CardTitle>
                                <CardDescription>
                                    Paste JSON array or upload a file. Data will be
                                    automatically analyzed to detect axes.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    className="font-cascadia text-sm min-h-40 max-h-56 overflow-y-auto custom-scroll"
                                    onChange={(e) => handleJsonChange(e.target.value)}
                                    placeholder={`[\n { "name": "A", "value": 400 },\n { "name": "B", "value": 300 },\n { "name": "C", "value": 200 } \n]`}
                                    value={rawJson}
                                />

                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Input
                                            accept=".json"
                                            className="cursor-pointer"
                                            onChange={handleFileUpload}
                                            type="file"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleClearData}
                                        size="icon-lg"
                                        variant="destructive"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Validation Errors */}
                    {dataErrors.length > 0 && (
                        <motion.div variants={itemVariants}>
                            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-300">
                                        <AlertCircle className="size-4" />
                                        Validation Errors
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="text-sm text-red-600 dark:text-red-200 space-y-1">
                                        {dataErrors.map((error, idx) => (
                                            <li key={idx}>• {error}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Settings */}
                    {hasValidData && (
                        <motion.div variants={itemVariants}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Settings2 className="size-4" />
                                        Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Chart Type
                                        </Label>
                                        <Select
                                            onValueChange={(val) =>
                                                setChartType(val as ChartType)
                                            }
                                            value={chartType}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CHART_TYPES.map((type) => (
                                                    <SelectItem
                                                        key={type.value}
                                                        value={type.value}
                                                    >
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Color Palette
                                        </Label>
                                        <Select
                                            onValueChange={(val) =>
                                                setColorPalette(val as ColorPaletteName)
                                            }
                                            value={colorPalette}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(COLOR_PALETTES).map((palette) => (
                                                    <SelectItem key={palette} value={palette}>
                                                        {palette.charAt(0).toUpperCase() +
                                                            palette.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex gap-3 items-center justify-between">
                                            <Label className="text-sm font-medium">
                                                Show Gridlines
                                            </Label>
                                            <Switch
                                                checked={showGridlines}
                                                onCheckedChange={setShowGridlines}
                                            />
                                        </div>

                                        <div className="flex gap-3 items-center justify-between">
                                            <Label className="text-sm font-medium">
                                                Show Labels
                                            </Label>
                                            <Switch
                                                checked={showLabels}
                                                onCheckedChange={setShowLabels}
                                            />
                                        </div>

                                        <div className="flex gap-3 items-center justify-between">
                                            <Label className="text-sm font-medium">
                                                Show Legend
                                            </Label>
                                            <Switch
                                                checked={showLegend}
                                                onCheckedChange={setShowLegend}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 w-full">
                                        <Label className="text-sm font-medium">
                                            Chart Title
                                        </Label>
                                        <Input
                                            className="w-full"
                                            onChange={(e) => setChartTitle(e.target.value)}
                                            placeholder="Optional title"
                                            value={chartTitle}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                X-Axis Label
                                            </Label>
                                            <Input
                                                onChange={(e) => setXAxisLabel(e.target.value)}
                                                placeholder={xAxisKey}
                                                value={xAxisLabel}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                Y-Axis Label
                                            </Label>
                                            <Input
                                                onChange={(e) => setYAxisLabel(e.target.value)}
                                                placeholder={yAxisKeys[0] || 'Value'}
                                                value={yAxisLabel}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>

                {/* Preview and Export Section */}
                <div className="space-y-4">
                    {hasValidData ? (
                        <Fragment>
                            <motion.div
                                animate="visible"
                                initial="hidden"
                                variants={itemVariants}
                            >
                                <Card className="flex flex-col h-full">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <ScanEye className="size-4" /> Preview
                                        </CardTitle>
                                        <CardDescription>
                                            {chartTitle ||
                                                `${CHART_TYPES.find((t) => t.value === chartType)?.label}`}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent
                                        className="flex-1 flex items-center justify-center"
                                        ref={chartRef}
                                    >
                                        <ResponsiveContainer height={400} width="100%">
                                            {renderChart()}
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                animate="visible"
                                initial="hidden"
                                transition={{ duration: 0.4, delay: 0.1 }}
                                variants={itemVariants}
                            >
                                <Card>
                                    <CardContent className="flex flex-wrap gap-2 pt-6">
                                        <Button
                                            className="flex-1"
                                            onClick={() => handleExport('png')}
                                        >
                                            <Download className="size-4 mb-0.5" />
                                            Download PNG
                                        </Button>

                                        <Button
                                            className="flex-1"
                                            onClick={() => handleExport('svg')}
                                            variant="secondary"
                                        >
                                            <Download className="size-4 mb-0.5" />
                                            Download SVG
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Fragment>
                    ) : (
                        <EmptyData
                            description="Paste JSON array or upload a file to generate a chart."
                            Icon={FileJson}
                            title="No Data Provided"
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
}
