'use client';

import {
    AnimatedWordRenderer,
    DefaultTooltipRenderer,
    type Word,
    WordCloud,
    type WordCloudProps,
} from '@isoterik/react-word-cloud';

import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { FileText, ImageDown, ScanEye, Settings2, Text } from 'lucide-react';
import { useMount } from 'nhb-hooks';
import {
    applyOpacityToHex,
    clampNumber,
    countWords,
    formatWithPlural,
    getRandomNumber,
} from 'nhb-toolbox';
import { useCallback, useRef, useState } from 'react';
import { PoweredBy } from '@/app/tools/_components/PoweredBy';
import EmptyData from '@/components/misc/empty-data';
import SmartAlert from '@/components/misc/smart-alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
    calculateFrequencies,
    FONT_FAMILIES_WORD_CLOUD,
    getTopWords,
    processText,
    WORD_CLOUD_DEFAULTS,
} from '@/lib/tools/word-cloud';

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

const {
    canvasHeight,
    canvasWidth,
    minFontSize,
    maxFontSize,
    minFontWeight,
    maxFontWeight,
    minRotation,
    maxRotation,
} = WORD_CLOUD_DEFAULTS;

export default function WordCloudGenerator() {
    const [text, setText] = useState('');
    const [maxWords, setMaxWords] = useState<number>(100);
    const [skipStopwords, setSkipStopwords] = useState(true);
    const [useRotation, setUseRotation] = useState(false);
    const [fontFamily, setFontFamily] = useState<string>('system-ui');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const canvasRef = useRef<HTMLDivElement>(null);

    const getWords = useCallback(() => {
        if (!text.trim()) return [];

        const processed = processText(text, skipStopwords);
        const frequencies = calculateFrequencies(processed);
        return getTopWords(frequencies, maxWords);
    }, [text, maxWords, skipStopwords]);

    const handleExport = useCallback(
        (format: 'svg' | 'png' | 'jpg') => {
            const svgElement = canvasRef.current?.querySelector('svg') as SVGSVGElement;
            if (!svgElement) return;

            let svgString = new XMLSerializer().serializeToString(svgElement);

            // Ensure namespace
            if (!svgString.includes('xmlns')) {
                svgString = svgString.replace(
                    '<svg',
                    '<svg xmlns="http://www.w3.org/2000/svg"'
                );
            }

            if (format === 'svg') {
                const blob = new Blob([svgString], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `word-cloud-${Date.now()}.svg`;
                link.click();

                setTimeout(() => URL.revokeObjectURL(url), 100);
                return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) return;

            const viewBox = svgElement.viewBox.baseVal;

            const width = viewBox.width || canvasWidth;
            const height = viewBox.height || canvasHeight;

            const scale = window.devicePixelRatio || 1;

            canvas.width = width * scale;
            canvas.height = height * scale;

            ctx.scale(scale, scale);

            // Background
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);

            const img = new Image();

            img.onload = () => {
                ctx.drawImage(img, 0, 0, width, height);

                const link = document.createElement('a');
                const quality = format === 'jpg' ? 1 : undefined;

                link.href = canvas.toDataURL(`image/${format}`, quality);
                link.download = `word-cloud-${Date.now()}.${format}`;
                link.click();
            };

            img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
        },
        [backgroundColor]
    );

    const animatedWordRenderer: WordCloudProps['renderTooltip'] = (data) => (
        <DefaultTooltipRenderer
            containerStyle={{
                borderRadius: '8px',
                flexDirection: 'column',
                minWidth: '96px',
                background: applyOpacityToHex(data.word?.fill, 90),
            }}
            data={data}
            placement="bottom"
            textStyle={{
                fontFamily: 'ui-monospace',
                fontSize: '16px',
            }}
            transform={false}
        />
    );

    const wordEntries: Word[] = getWords().map((entry) => ({
        text: entry.word,
        value: entry.frequency,
    }));

    const values = wordEntries.map((w) => w.value);

    const minFreq = values.length ? Math.min(...values) : 0;
    const maxFreq = values.length ? Math.max(...values) : 0;

    const calculateFontSize = useCallback(
        (wordOccurrences: number) => {
            if (maxFreq === minFreq) return maxFontSize / 2;

            const normalizedValue = (wordOccurrences - minFreq) / (maxFreq - minFreq);
            const fontSize = minFontSize + normalizedValue * (maxFontSize - minFontSize);
            return Math.round(fontSize);
        },
        [maxFreq, minFreq]
    );

    const calculateFontWeight = useCallback(
        (wordOccurrences: number) => {
            if (maxFreq === minFreq) return maxFontWeight;

            const normalizedValue = (wordOccurrences - minFreq) / (maxFreq - minFreq);

            return Math.round(
                minFontWeight + normalizedValue * (maxFontWeight - minFontWeight)
            );
        },
        [maxFreq, minFreq]
    );

    const resolveRotate = useCallback(() => {
        return useRotation ? getRandomNumber({ min: minRotation, max: maxRotation }) : 0;
    }, [useRotation]);

    const hasText = text.trim().length > 0;
    const wordCount = wordEntries.length;

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
                    {/* Text Input */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="size-5" />
                                    Paste Text
                                </CardTitle>
                                <CardDescription>
                                    Enter or paste text to generate a word cloud. Stopwords
                                    (the, and, is, etc.) are removable.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    className="font-cascadia text-sm min-h-32 max-h-48 overflow-y-auto custom-scroll"
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Paste your text here..."
                                    rows={10}
                                    value={text}
                                />
                            </CardContent>
                            <CardFooter>
                                <SmartAlert
                                    description={
                                        <span className="font-semibold">
                                            Total {formatWithPlural(countWords(text), 'Word')}
                                        </span>
                                    }
                                />
                            </CardFooter>
                        </Card>
                    </motion.div>

                    {/* Settings */}
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
                                    <Label className="text-sm font-medium">Max Words</Label>
                                    <Input
                                        className="w-20"
                                        max={999}
                                        min={2}
                                        onChange={(e) =>
                                            setMaxWords(clampNumber(+e.target.value, 1, 999))
                                        }
                                        type="number"
                                        value={maxWords}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Font</Label>
                                    <Select
                                        onValueChange={(val) => setFontFamily(val)}
                                        value={fontFamily}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FONT_FAMILIES_WORD_CLOUD.map((font) => (
                                                <SelectItem
                                                    key={font.value}
                                                    value={font.fontFamily}
                                                >
                                                    {font.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Background Color
                                    </Label>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <input
                                            className="w-10 h-9.5 py-0 rounded cursor-pointer border"
                                            onChange={(e) => setBackgroundColor(e.target.value)}
                                            type="color"
                                            value={backgroundColor}
                                        />
                                        <Input
                                            className="w-24"
                                            onChange={(e) => setBackgroundColor(e.target.value)}
                                            type="text"
                                            value={backgroundColor}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Skip Stopwords
                                    </Label>
                                    <Switch
                                        checked={skipStopwords}
                                        onCheckedChange={setSkipStopwords}
                                        size="lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Random Rotation
                                    </Label>
                                    <Switch
                                        checked={useRotation}
                                        onCheckedChange={setUseRotation}
                                        size="lg"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <PoweredBy
                        description="Visual word cloud is generated using `@isoterik/react-word-cloud`."
                        name="@isoterik/react-word-cloud"
                        url="https://github.com/isoteriksoftware/react-word-cloud.git"
                    />
                </div>

                {/* Preview and Export Section */}
                <div className="space-y-4">
                    {/* Word Cloud Preview */}
                    {hasText ? (
                        <motion.div animate="visible" initial="hidden" variants={itemVariants}>
                            <Card className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <ScanEye className="size-4" /> Preview
                                    </CardTitle>
                                    <CardDescription>
                                        <SmartAlert
                                            description={
                                                wordCount === 0
                                                    ? 'Paste text in the input area to generate word cloud.'
                                                    : `${formatWithPlural(wordCount, 'unique word')} selected`
                                            }
                                        />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div
                                        className="w-full rounded border overflow-hidden"
                                        ref={canvasRef}
                                    >
                                        {wordCount > 0 ? (
                                            <div
                                                className="flex items-center h-fit justify-center"
                                                style={{ backgroundColor }}
                                            >
                                                <WordCloud
                                                    enableTooltip
                                                    font={fontFamily}
                                                    fontSize={(w) => calculateFontSize(w.value)}
                                                    fontWeight={(w) =>
                                                        calculateFontWeight(w.value)
                                                    }
                                                    height={canvasHeight}
                                                    key={`${maxWords}-${text.length}-${useRotation}-${skipStopwords}`}
                                                    padding={4}
                                                    renderTooltip={animatedWordRenderer}
                                                    renderWord={(data, ref) => (
                                                        <AnimatedWordRenderer
                                                            animationDelay={25}
                                                            data={data}
                                                            ref={ref}
                                                        />
                                                    )}
                                                    rotate={resolveRotate}
                                                    spiral="rectangular"
                                                    svgProps={{
                                                        preserveAspectRatio: 'xMidYMid meet',
                                                    }}
                                                    width={canvasWidth}
                                                    words={structuredClone(wordEntries)}
                                                />
                                            </div>
                                        ) : (
                                            <EmptyData
                                                description="Paste text in the input area or set Max Words to more than 0 to generate a word cloud."
                                                Icon={Text}
                                                title="No Text Provided"
                                            />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <EmptyData
                            description="Paste text in the input area to generate a word cloud."
                            Icon={FileText}
                            title="No Text Provided"
                        />
                    )}

                    {/* Export */}
                    {hasText && (
                        <motion.div
                            animate="visible"
                            initial="hidden"
                            transition={{ duration: 0.4, delay: 0.1 }}
                            variants={itemVariants}
                        >
                            <Card>
                                <CardContent className="flex flex-wrap justify-between gap-2">
                                    <Button
                                        disabled={wordCount === 0}
                                        onClick={() => handleExport('svg')}
                                        variant="default"
                                    >
                                        <ImageDown className="size-4 mb-0.5" />
                                        Download SVG
                                    </Button>

                                    <Button
                                        disabled={wordCount === 0}
                                        onClick={() => handleExport('png')}
                                        variant="outline"
                                    >
                                        <ImageDown className="size-4 mb-0.5" />
                                        Download PNG
                                    </Button>

                                    <Button
                                        disabled={wordCount === 0}
                                        onClick={() => handleExport('jpg')}
                                        variant="secondary"
                                    >
                                        <ImageDown className="size-4 mb-0.5" />
                                        Download JPG
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
