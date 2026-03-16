'use client';

import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { AlertOctagon, FileText, ImageDown, ScanEye, Settings2, Text } from 'lucide-react';
import { useMount } from 'nhb-hooks';
import { clampNumber, countWords, formatWithPlural } from 'nhb-toolbox';
import { useCallback, useRef, useState } from 'react';
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
import { FONT_OPTIONS } from '@/lib/constants';
import {
    calculateFrequencies,
    generateColorPalette,
    getTopWords,
    processText,
    randomLayout,
    spiralLayout,
    type WordPosition,
} from '@/lib/tools/word-cloud';
import WordCloudCanvas from './WordCloudCanvas';

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

const FONT_FAMILIES = [
    {
        value: 'system-ui',
        label: 'System UI',
        fontFamily: 'system-ui',
    },
    {
        value: 'arial',
        label: 'Arial',
        fontFamily: '"Arial"',
    },
    ...FONT_OPTIONS,
    {
        value: 'times',
        label: 'Times New Roman',
        fontFamily: '"Times New Roman"',
    },
    {
        value: 'digital',
        label: 'Digital Clock',
        fontFamily: '"Digital-7 Mono"',
    },
    {
        value: 'verdana',
        label: 'Verdana',
        fontFamily: '"Verdana"',
    },
    {
        value: 'courier',
        label: 'Courier',
        fontFamily: '"Courier"',
    },
] as const;

type LayoutType = 'spiral' | 'random';

export default function WordCloudGenerator() {
    const [text, setText] = useState('');
    const [maxWords, setMaxWords] = useState<number>(100);
    const [layoutType, setLayoutType] = useState<LayoutType>('random');
    const [skipStopwords, setSkipStopwords] = useState(true);
    const [fontFamily, setFontFamily] = useState<string>('system-ui');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const canvasRef = useRef<HTMLDivElement>(null);

    const words = useCallback(() => {
        if (!text.trim()) return [];

        const processed = processText(text, skipStopwords);
        const frequencies = calculateFrequencies(processed);
        return getTopWords(frequencies, maxWords);
    }, [text, maxWords, skipStopwords]);

    const wordPositions = useCallback((): WordPosition[] => {
        const wordList = words();
        if (wordList.length === 0) return [];

        const colors = generateColorPalette(wordList.length);
        const layout = layoutType === 'spiral' ? spiralLayout : randomLayout;

        return layout(wordList, 1600, 1200, colors);
    }, [words, layoutType]);

    const handleExport = useCallback(
        (format: 'png' | 'jpeg') => {
            const canvas = canvasRef.current?.querySelector('canvas') as HTMLCanvasElement;
            if (!canvas) return;

            // Create a high-quality temporary canvas
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

            if (!tempCtx) return;

            // Fill background
            tempCtx.fillStyle = backgroundColor;
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            // Draw word cloud with high quality settings
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';
            tempCtx.drawImage(canvas, 0, 0);

            // Download with appropriate quality settings
            const link = document.createElement('a');
            const quality = format === 'png' ? undefined : 1;
            link.href = tempCanvas.toDataURL(`image/${format}`, quality);
            link.download = `word-cloud-${Date.now()}.${format}`;
            link.click();
        },
        [backgroundColor]
    );

    const hasText = text.trim().length > 0;
    const wordCount = words().length;

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
                                        max={9999}
                                        min={2}
                                        onChange={(e) =>
                                            setMaxWords(clampNumber(+e.target.value, 1, 9999))
                                        }
                                        type="number"
                                        value={maxWords}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Layout</Label>
                                    <Select
                                        onValueChange={(val) =>
                                            setLayoutType(val as LayoutType)
                                        }
                                        value={layoutType}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="spiral">Spiral</SelectItem>
                                            <SelectItem value="random">Random</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                            {FONT_FAMILIES.map((font) => (
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
                                            className="w-12 h-9.5 py-0 rounded cursor-pointer border"
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
                                        size="default"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <SmartAlert
                        className="border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100"
                        description="A simplified algorithm is implemented to generate spiral layout. Use a professional tool to generate better spiral word cloud layout."
                        Icon={AlertOctagon}
                        title="About Spiral Layout"
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
                                                    ? 'Paste text in the input area or set Max Words to more than 0'
                                                    : `${formatWithPlural(wordCount, 'unique word')} found`
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
                                            <WordCloudCanvas
                                                backgroundColor={backgroundColor}
                                                fontFamily={fontFamily}
                                                words={wordPositions()}
                                            />
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
                                <CardContent className="flex flex-wrap gap-2">
                                    <Button
                                        className="flex-1"
                                        disabled={wordCount === 0}
                                        onClick={() => handleExport('png')}
                                    >
                                        <ImageDown className="size-4 mb-0.5" />
                                        Download PNG
                                    </Button>

                                    <Button
                                        className="flex-1"
                                        disabled={wordCount === 0}
                                        onClick={() => handleExport('jpeg')}
                                        variant="secondary"
                                    >
                                        <ImageDown className="size-4 mb-0.5" />
                                        Download JPEG
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
