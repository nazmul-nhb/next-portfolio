'use client';

import { motion, type Variants } from 'framer-motion';
import { ChartSpline, ImageDown, QrCode } from 'lucide-react';
import { useMount } from 'nhb-hooks';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { useMemo, useRef, useState } from 'react';
import { PoweredBy } from '@/app/tools/_components/PoweredBy';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import CopyButton from '@/components/misc/copy-button';
import EmptyData from '@/components/misc/empty-data';
import SmartAlert from '@/components/misc/smart-alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

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

type QRErrorLevel = 'L' | 'M' | 'Q' | 'H';

export default function QRCodeGenerator() {
    const [qrValue, setQrValue] = useState('');
    const [size, setSize] = useState(256);
    const [level, setLevel] = useState<QRErrorLevel>('Q');
    const [margin, setMargin] = useState(1);
    const [bgColor, setBgColor] = useState('#ffffff');
    const [fgColor, setFgColor] = useState('#000000');

    const qrRef = useRef<HTMLDivElement>(null);

    const qrStats = useMemo(() => {
        return {
            textLength: qrValue.length,
            size,
            level,
            margin,
        };
    }, [qrValue, size, level, margin]);

    const handleDownload = () => {
        const canvas = qrRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
        if (canvas) {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `qr-code-${Date.now()}.png`;
            link.click();
        }
    };

    const handleDownloadSVG = () => {
        const svg = qrRef.current?.querySelector('svg');
        if (svg) {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svg);
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `qr-code-${Date.now()}.svg`;
            link.click();
            URL.revokeObjectURL(link.href);
        }
    };

    const hasQRValue = qrValue.trim().length > 0;

    return useMount(
        <div className="space-y-8">
            <TitleWithShare
                description="Generate QR codes from text or URLs with customizable size, colors, and error correction levels."
                route="/tools/qr-code-generator"
                title="QR Code Generator"
            />

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                {/* Input and Options Section */}
                <div className="space-y-4">
                    {/* Text Input */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="size-5" />
                                Text or URL
                            </CardTitle>
                            <CardDescription>
                                Enter text or a URL to generate a QR code.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Input
                                className="w-full font-cascadia text-sm"
                                onChange={(e) => setQrValue(e.target.value)}
                                placeholder="Enter text or URL..."
                                value={qrValue}
                            />
                        </CardContent>
                    </Card>

                    {/* Size Control */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Size</CardTitle>
                            <CardDescription>QR code dimensions in pixels</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Slider
                                className="w-full"
                                max={512}
                                min={128}
                                onValueChange={(value) => setSize(value[0])}
                                step={8}
                                value={[size]}
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">128px</span>
                                <Badge className="font-cascadia" variant="outline">
                                    {size}px
                                </Badge>
                                <span className="text-sm text-muted-foreground">512px</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Margin Control */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Margin (Quiet Zone)</CardTitle>
                            <CardDescription>Space around the QR code</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Slider
                                className="w-full"
                                max={10}
                                min={0}
                                onValueChange={(value) => setMargin(value[0])}
                                step={1}
                                value={[margin]}
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">None</span>
                                <Badge className="font-cascadia" variant="outline">
                                    {margin}
                                </Badge>
                                <span className="text-sm text-muted-foreground">10</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Correction Level */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Error Correction</CardTitle>
                            <CardDescription>
                                Ability to recover if QR code is damaged
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select
                                onValueChange={(value) => setLevel(value as QRErrorLevel)}
                                value={level}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="L">Level L (~7% recovery)</SelectItem>
                                    <SelectItem value="M">Level M (~15% recovery)</SelectItem>
                                    <SelectItem value="Q">Level Q (~25% recovery)</SelectItem>
                                    <SelectItem value="H">Level H (~30% recovery)</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Colors */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Colors</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2 justify-between">
                            <div className="space-y-2">
                                <label
                                    className="text-sm font-medium text-muted-foreground"
                                    htmlFor="dark-color"
                                >
                                    Dark Color
                                </label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <Input
                                        className="h-10 w-16 cursor-pointer"
                                        id="dark-color"
                                        onChange={(e) => setFgColor(e.target.value)}
                                        type="color"
                                        value={fgColor}
                                    />
                                    <Input
                                        className="w-fit h-10 font-cascadia text-sm"
                                        onChange={(e) => setFgColor(e.target.value)}
                                        placeholder="#000000"
                                        value={fgColor}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label
                                    className="text-sm font-medium text-muted-foreground"
                                    htmlFor="light-color"
                                >
                                    Light Color (Background)
                                </label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <Input
                                        className="h-10 w-16 cursor-pointer"
                                        id="light-color"
                                        onChange={(e) => setBgColor(e.target.value)}
                                        type="color"
                                        value={bgColor}
                                    />
                                    <Input
                                        className="h-10 font-cascadia text-sm w-fit"
                                        onChange={(e) => setBgColor(e.target.value)}
                                        placeholder="#ffffff"
                                        value={bgColor}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <PoweredBy
                        description="This tool uses `qrcode.react` for fast, client-side QR code generation and rendering."
                        name="qrcode.react"
                        url="https://github.com/zpao/qrcode.react"
                    />
                </div>

                {/* Preview and Stats Section */}
                <div className="space-y-4">
                    {/* QR Code Preview */}
                    {hasQRValue ? (
                        <motion.div animate="visible" initial="hidden" variants={itemVariants}>
                            <Card className="flex flex-col items-center justify-center pb-0!">
                                <CardHeader className="w-full">
                                    <CardTitle className="text-base text-center">
                                        QR Code Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="max-w-full max-h-fit aspect-square pb-0">
                                    <div
                                        className="p-4 rounded-lg"
                                        ref={qrRef}
                                        style={{
                                            backgroundColor: bgColor,
                                        }}
                                    >
                                        <QRCodeCanvas
                                            bgColor={bgColor}
                                            className="max-w-full max-h-fit aspect-square"
                                            fgColor={fgColor}
                                            level={level}
                                            marginSize={margin}
                                            size={size}
                                            title="QR Code Canvas"
                                            value={qrValue}
                                        />
                                        <QRCodeSVG
                                            bgColor={bgColor}
                                            className="max-w-full max-h-fit aspect-square sr-only"
                                            fgColor={fgColor}
                                            level={level}
                                            marginSize={margin}
                                            size={size}
                                            title="QR Code SVG"
                                            value={qrValue}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <EmptyData
                            description="Enter text or URL above to preview the QR code."
                            Icon={QrCode}
                            title="No QR Code Generated"
                        />
                    )}

                    {/* Download/Copy Actions */}
                    {hasQRValue && (
                        <motion.div
                            animate="visible"
                            initial="hidden"
                            transition={{ duration: 0.4, delay: 0.1 }}
                            variants={itemVariants}
                        >
                            <Card>
                                <CardContent className="flex flex-wrap gap-2">
                                    <Button
                                        onClick={handleDownload}
                                        size="default"
                                        variant="default"
                                    >
                                        <ImageDown className="size-4" />
                                        Download PNG
                                    </Button>
                                    <Button
                                        onClick={handleDownloadSVG}
                                        size="default"
                                        variant="secondary"
                                    >
                                        <ImageDown className="size-4" />
                                        Download SVG
                                    </Button>
                                    <CopyButton
                                        buttonText={{
                                            before: 'Copy Value',
                                            after: 'Value Copied',
                                        }}
                                        size="default"
                                        textToCopy={qrValue}
                                        variant="outline"
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Stats Card */}
                    {hasQRValue && (
                        <motion.div
                            animate="visible"
                            initial="hidden"
                            transition={{ duration: 0.4 }}
                            variants={itemVariants}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <ChartSpline className="size-4" />
                                        Statistics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <motion.div
                                        animate="visible"
                                        className="space-y-3"
                                        initial="hidden"
                                        variants={containerVariants}
                                    >
                                        <motion.div
                                            className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                            variants={itemVariants}
                                        >
                                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                                Content Length
                                            </p>
                                            <Badge className="font-cascadia" variant="outline">
                                                {qrStats.textLength} characters
                                            </Badge>
                                        </motion.div>

                                        <motion.div
                                            className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                            variants={itemVariants}
                                        >
                                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                                Size
                                            </p>
                                            <Badge className="font-cascadia" variant="outline">
                                                {qrStats.size}x{qrStats.size}px
                                            </Badge>
                                        </motion.div>

                                        <motion.div
                                            className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                            variants={itemVariants}
                                        >
                                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                                Error Correction
                                            </p>
                                            <Badge className="font-cascadia" variant="outline">
                                                Level {qrStats.level}
                                            </Badge>
                                        </motion.div>

                                        <motion.div
                                            className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                            variants={itemVariants}
                                        >
                                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                                Margin
                                            </p>
                                            <Badge className="font-cascadia" variant="outline">
                                                {qrStats.margin}
                                            </Badge>
                                        </motion.div>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Info Alert */}
                    <SmartAlert description="QR code generation happens locally in your browser. No data is sent to any server." />
                </div>
            </div>
        </div>
    );
}
