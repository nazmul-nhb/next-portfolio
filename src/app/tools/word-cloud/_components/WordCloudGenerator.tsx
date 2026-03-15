'use client';

import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Download, Shuffle } from 'lucide-react';
import { useMount } from 'nhb-hooks';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
    calculateFrequencies,
    generateColorPalette,
    getTopWords,
    processText,
    randomLayout,
    spiralLayout,
    type WordPosition,
} from '@/lib/word-cloud';
import WordCloudCanvas from './WordCloudCanvas';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
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
            link.download = `word-cloud.${format}`;
            link.click();
        },
        [backgroundColor]
    );

    return useMount(
        <motion.div
            animate="visible"
            className="space-y-8"
            initial="hidden"
            variants={containerVariants}
        >
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1fr_minmax(20rem,350px)]">
                {/* Main Content */}
                <div className="space-y-6">
                    {/* Text Input */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shuffle className="size-5" />
                                    Paste Text
                                </CardTitle>
                                <CardDescription>
                                    Enter or paste text to generate a word cloud. Stopwords
                                    (the, and, is, etc.) are automatically removed.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    className="font-mono text-sm"
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Paste your text here..."
                                    rows={10}
                                    value={text}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Word Cloud Preview */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                                <CardDescription>
                                    {words().length === 0
                                        ? 'Paste text to generate word cloud'
                                        : `${words().length} words found`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={cn(
                                        'w-full rounded border',
                                        words().length === 0 &&
                                            'bg-gray-100 dark:bg-gray-800 h-64 flex items-center justify-center'
                                    )}
                                    ref={canvasRef}
                                >
                                    {words().length > 0 ? (
                                        <WordCloudCanvas
                                            backgroundColor={backgroundColor}
                                            fontFamily={fontFamily}
                                            words={wordPositions()}
                                        />
                                    ) : (
                                        <p className="text-muted-foreground">
                                            No words to display
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Controls Sidebar */}
                <motion.div className="space-y-4" variants={itemVariants}>
                    {/* Word Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium">Max Words</Label>
                                <input
                                    className={cn(
                                        'w-full mt-1 px-3 py-2 border rounded-md',
                                        'bg-background border-input',
                                        'text-sm transition-colors',
                                        'focus:outline-none focus:ring-2 focus:ring-primary'
                                    )}
                                    max={500}
                                    min={10}
                                    onChange={(e) =>
                                        setMaxWords(Math.max(10, +e.target.value || 100))
                                    }
                                    type="number"
                                    value={maxWords}
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Layout</Label>
                                <Select
                                    onValueChange={(val) => setLayoutType(val as LayoutType)}
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

                            <div>
                                <Label className="text-sm font-medium">Font</Label>
                                <Select
                                    onValueChange={(val) => setFontFamily(val as FontFamily)}
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

                            <div>
                                <Label className="text-sm font-medium">Background</Label>
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

                    {/* Export */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Export</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                className="w-full gap-2"
                                disabled={words().length === 0}
                                onClick={() => handleExport('png')}
                                variant="outline"
                            >
                                <Download className="size-4" />
                                Download PNG
                            </Button>

                            <Button
                                className="w-full gap-2"
                                disabled={words().length === 0}
                                onClick={() => handleExport('jpeg')}
                                variant="outline"
                            >
                                <Download className="size-4" />
                                Download JPEG
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Info */}
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardHeader>
                            <CardTitle className="text-base">Info</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1 text-blue-900 dark:text-blue-100">
                            <p>• Larger words appear more frequently</p>
                            <p>• Common words are automatically removed</p>
                            <p>• All processing happens in browser</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
