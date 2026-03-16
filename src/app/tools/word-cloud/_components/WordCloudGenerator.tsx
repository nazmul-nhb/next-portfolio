'use client';

import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import { useMount } from 'nhb-hooks';
import { useCallback, useRef, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
    calculateFrequencies,
    generateColorPalette,
    getTopWords,
    processText,
    randomLayout,
    spiralLayout,
    type WordPosition,
} from '@/lib/tools/word-cloud';
import { cn } from '@/lib/utils';
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

type LayoutType = 'spiral' | 'random';
type FontFamily = 'Arial' | 'Georgia' | 'Courier' | 'Verdana' | 'Times New Roman';

export default function WordCloudGenerator() {
    const [text, setText] = useState('');
    const [maxWords, setMaxWords] = useState<number>(100);
    const [layoutType, setLayoutType] = useState<LayoutType>('spiral');
    const [fontFamily, setFontFamily] = useState<FontFamily>('Arial');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const canvasRef = useRef<HTMLDivElement>(null);

    const words = useCallback(() => {
        if (!text.trim()) return [];

        const processed = processText(text);
        const frequencies = calculateFrequencies(processed);
        return getTopWords(frequencies, maxWords);
    }, [text, maxWords]);

    const wordPositions = useCallback((): WordPosition[] => {
        const wordList = words();
        if (wordList.length === 0) return [];

        const colors = generateColorPalette(wordList.length);
        const layout = layoutType === 'spiral' ? spiralLayout : randomLayout;

        return layout(wordList, 800, 600, colors);
    }, [words, layoutType]);

    const handleExport = useCallback(
        (format: 'png' | 'jpeg') => {
            const canvas = canvasRef.current?.querySelector('canvas') as HTMLCanvasElement;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Create temporary canvas with background
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');

            if (!tempCtx) return;

            // Fill background
            tempCtx.fillStyle = backgroundColor;
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            // Draw word cloud
            tempCtx.drawImage(canvas, 0, 0);

            // Download
            const link = document.createElement('a');
            link.href = tempCanvas.toDataURL(`image/${format}`);
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
                                    (the, and, is, etc.) are automatically removed.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    className="font-cascadia text-sm h-40 max-h-60 overflow-y-auto custom-scroll"
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Paste your text here..."
                                    rows={10}
                                    value={text}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Settings */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    <Label className="text-sm font-medium">Max Words</Label>
                                    <Input
                                        max={500}
                                        min={10}
                                        onChange={(e) => setMaxWords(+e.target.value)}
                                        type="number"
                                        value={maxWords}
                                    />
                                </div>

                                <div className="space-y-4">
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

                                <div className="space-y-4">
                                    <Label className="text-sm font-medium">Font</Label>
                                    <Select
                                        onValueChange={(val) =>
                                            setFontFamily(val as FontFamily)
                                        }
                                        value={fontFamily}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Arial">Arial</SelectItem>
                                            <SelectItem value="Georgia">Georgia</SelectItem>
                                            <SelectItem value="Courier">Courier</SelectItem>
                                            <SelectItem value="Verdana">Verdana</SelectItem>
                                            <SelectItem value="Times New Roman">
                                                Times New Roman
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-sm font-medium">
                                        Background Color
                                    </Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <input
                                            className="w-12 h-10 rounded cursor-pointer"
                                            onChange={(e) => setBackgroundColor(e.target.value)}
                                            type="color"
                                            value={backgroundColor}
                                        />
                                        <input
                                            className={cn(
                                                'flex-1 px-3 py-2 border rounded-md',
                                                'bg-background border-input text-sm',
                                                'focus:outline-none focus:ring-2 focus:ring-primary'
                                            )}
                                            onChange={(e) => setBackgroundColor(e.target.value)}
                                            type="text"
                                            value={backgroundColor}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Preview and Export Section */}
                <div className="space-y-4">
                    {/* Word Cloud Preview */}
                    {hasText ? (
                        <motion.div animate="visible" initial="hidden" variants={itemVariants}>
                            <Card className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-base">Preview</CardTitle>
                                    <CardDescription>
                                        {wordCount === 0
                                            ? 'Processing text...'
                                            : `${wordCount} words found`}
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
                                            <div className="bg-gray-100 dark:bg-gray-800 h-64 flex items-center justify-center">
                                                <p className="text-muted-foreground">
                                                    Processing...
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <EmptyData
                            description="Paste text on the left to generate a word cloud."
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
                                <CardContent className="flex flex-wrap gap-2 pt-6">
                                    <Button
                                        className="flex-1"
                                        disabled={wordCount === 0}
                                        onClick={() => handleExport('png')}
                                    >
                                        <Download className="size-4" />
                                        Download PNG
                                    </Button>

                                    <Button
                                        className="flex-1"
                                        disabled={wordCount === 0}
                                        onClick={() => handleExport('jpeg')}
                                        variant="secondary"
                                    >
                                        <Download className="size-4" />
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
