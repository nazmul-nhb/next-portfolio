'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Plus, RefreshCw, ShipWheel, Shuffle, SquareMenu, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useMount, useStorage } from 'nhb-hooks';
import {
    generateQueryParams,
    getRandomNumber,
    isNonEmptyString,
    shuffleArray,
    trimString,
    truncateString,
} from 'nhb-toolbox';
import type { HSL } from 'nhb-toolbox/colors/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import CodeBlock from '@/components/misc/code-block';
import CopyButton from '@/components/misc/copy-button';
import EmptyData from '@/components/misc/empty-data';
import ShareButton from '@/components/misc/share-button';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DEFAULT_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/**
 * Helper function to generate color using HSL
 * Distributes colors evenly around the hue spectrum
 */
function generateColorForSlice(index: number, total: number): HSL {
    const hue = (index / total) * 360;

    return `hsl(${hue}, ${66}%, ${55}%)`;
}

/**
 * Helper to convert polar coordinates to cartesian
 */
function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
) {
    const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180.0);
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
}

/**
 * SVG Arc path generator
 */
function describeArc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
): string {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return [
        'M',
        x,
        y,
        'L',
        start.x,
        start.y,
        'A',
        radius,
        radius,
        0,
        largeArcFlag,
        0,
        end.x,
        end.y,
        'Z',
    ].join(' ');
}

export default function SpinningWheel() {
    const searchParams = useSearchParams();
    const [optionInput, setOptionInput] = useState('');
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<string | null>(null);
    const animationRef = useRef<number | null>(null);

    // Load options from storage or URL params
    const optionsStore = useStorage<string[]>({ key: 'nhb-spin-wheel' });

    const [options, setOptions] = useState<string[]>(DEFAULT_OPTIONS);

    // Initialize from URL params or storage on mount
    useEffect(() => {
        const itemsParam = searchParams.get('items');

        if (isNonEmptyString(itemsParam)) {
            const urlOptions = trimString(itemsParam.split(','));
            if (urlOptions.length > 1) {
                setOptions(urlOptions);
                optionsStore.set(urlOptions);

                return;
            }
        }

        if (optionsStore.value && optionsStore.value.length > 1) {
            setOptions(optionsStore.value);
        }
    }, [searchParams, optionsStore.value, optionsStore.set]);

    const handleAddOption = () => {
        const trimmed = optionInput.trim();
        if (!trimmed) {
            toast.error('Please enter an option');
            return;
        }

        if (options.includes(trimmed)) {
            toast.error('This option already exists');
            return;
        }

        const newOptions = [...options, trimmed];
        setOptions(newOptions);
        optionsStore.set(newOptions);
        setOptionInput('');
        toast.success('Option added');
    };

    const handleRemoveOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
        optionsStore.set(newOptions);
        toast.success('Option removed');
    };

    const handleShuffle = () => {
        const shuffled = shuffleArray(options);
        setOptions(shuffled);
        optionsStore.set(shuffled);
        toast.success('Options shuffled');
    };

    const handleReset = () => {
        setOptions(DEFAULT_OPTIONS);
        optionsStore.set(DEFAULT_OPTIONS);
        setResult(null);
        setRotation(0);
        toast.success('Wheel reset to default');
    };

    const handleSpin = () => {
        if (spinning) return;
        if (options.length < 2) {
            toast.error('Add at least 2 options to spin');
            return;
        }

        setSpinning(true);
        setResult(null);

        // Generate random rotation - between 5-10 full rotations plus random offset
        const fullRotations = getRandomNumber({ min: 7, max: options.length + 7 });
        const randomOffset = getRandomNumber({ max: 359 }); // 0-359
        const totalRotation = fullRotations * 360 + randomOffset;

        // Use Framer Motion for smooth spinning (easing out over 5+ seconds)
        const startRotation = rotation;
        const startTime = Date.now();
        const duration = 5000; // 5 seconds

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing: cubic-out for natural deceleration
            const easeProgress = 1 - (1 - progress) ** 3;
            const currentRotation = startRotation + totalRotation * easeProgress;

            setRotation(currentRotation % 360);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                // Animation complete - determine winner
                const normalizedRotation = currentRotation % 360;
                const sliceAngle = 360 / options.length;

                // Calculate which slice is at the top
                // The pointer is at the top, so we check which slice overlaps with top
                const adjustedIndex =
                    Math.floor((360 - normalizedRotation + sliceAngle / 2) / sliceAngle) %
                    options.length;

                setResult(options[adjustedIndex]);
                setSpinning(false);
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    };

    const sharableLink = useMemo(() => {
        if (options.length < 2) return '/tools/spin-wheel';

        const query = generateQueryParams({ items: options.join(',') });

        return `/tools/spin-wheel${query}` as const;
    }, [options]);

    // Clean up animation on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return useMount(
        <div className="space-y-8">
            <TitleWithShare
                description="Create custom options, spin the wheel, and let randomness decide. Perfect for making decisions or having fun with friends."
                route="/tools/spin-wheel"
                title="Spinning Wheel"
            />

            <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                {/* Left Column - Input */}
                <div className="space-y-4">
                    {/* Options Input */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shuffle className="size-5" />
                                Add Options
                            </CardTitle>
                            <CardDescription>
                                Add options to your wheel (minimum 2 required)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    onChange={(e) => setOptionInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddOption();
                                    }}
                                    placeholder="Enter an option..."
                                    value={optionInput}
                                />
                                <Button onClick={handleAddOption} size="lg">
                                    <Plus className="size-4" /> Add
                                </Button>
                            </div>
                            <h3 className="font-medium text-base flex items-center gap-2">
                                <SquareMenu className="size-4 mb-0.5" /> Options (
                                {options.length})
                            </h3>
                            <div className="space-y-2 max-h-58 overflow-y-auto custom-scroll pr-2">
                                {options.map((option, index) => (
                                    <motion.div
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center justify-between p-2 rounded-md bg-muted/50 border"
                                        exit={{ opacity: 0, x: -10 }}
                                        initial={{ opacity: 0, x: 10 }}
                                        key={`${option}-${index}`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div
                                                className="size-3 rounded-full shrink-0"
                                                style={{
                                                    backgroundColor: generateColorForSlice(
                                                        index,
                                                        options.length
                                                    ),
                                                }}
                                            />
                                            <span className="text-sm truncate text-muted-foreground">
                                                {option}
                                            </span>
                                        </div>
                                        <Button
                                            className="h-auto p-1 text-destructive"
                                            onClick={() => handleRemoveOption(index)}
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            className="flex-1"
                            disabled={spinning || options.length < 2}
                            onClick={handleShuffle}
                            size="lg"
                            variant="outline"
                        >
                            <Shuffle className="size-4" />
                            Shuffle
                        </Button>
                        <Button
                            className="flex-1"
                            disabled={spinning}
                            onClick={handleReset}
                            size="lg"
                            variant="destructive"
                        >
                            <RefreshCw className="size-4" />
                            Reset
                        </Button>
                        <Button
                            className="text-base px-12 font-semibold"
                            disabled={spinning || options.length < 2}
                            onClick={handleSpin}
                            size="lg"
                        >
                            <ShipWheel
                                className={cn('size-5', {
                                    'animate-spin': spinning,
                                })}
                            />
                            Spin!
                        </Button>
                    </div>

                    {/* Result Display */}
                    <AnimatePresence mode="wait">
                        {result && (
                            <motion.div
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="w-full"
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                key="result"
                                transition={{
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 20,
                                }}
                            >
                                <Card className="border-green-500/30 bg-green-50/30 dark:bg-green-950/20 w-full">
                                    <CardContent className="space-y-3">
                                        <div className="p-1 rounded-md bg-background border border-green-500/50">
                                            <CodeBlock className="text-center text-xl font-bold">
                                                🎉 Winner: {result}
                                            </CodeBlock>
                                        </div>
                                        <div className="flex gap-2 items-center flex-wrap">
                                            <CopyButton
                                                buttonText={{
                                                    after: 'Result Copied',
                                                    before: 'Copy Result',
                                                }}
                                                className="flex-1 w-full"
                                                size="lg"
                                                successMsg="Result copied to clipboard!"
                                                textToCopy={result}
                                            />
                                            <ShareButton
                                                buttonLabel="Share wheel"
                                                buttonProps={{ size: 'lg' }}
                                                className="text-base flex-1 w-full"
                                                route={sharableLink}
                                                shareLabel="Share current wheel"
                                                shareText="Make random decision with the spinning wheel"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column - Wheel & Result */}
                {options.length >= 2 ? (
                    <Card className="w-full max-h-fit relative overflow-hidden p-0">
                        {/* SVG Wheel */}
                        <svg
                            className="w-full h-full max-h-fit"
                            preserveAspectRatio="xMidYMid meet"
                            style={{ aspectRatio: '1 / 1', minHeight: '300px' }}
                            viewBox="0 0 400 400"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <title>Spinning Wheel</title>
                            {/* Rotating wheel group */}
                            <g
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    transformOrigin: '200px 200px',
                                    transition: spinning ? 'none' : 'transform 0s ease-out',
                                }}
                            >
                                {options.map((option, index) => {
                                    const sliceAngle = 360 / options.length;
                                    const startAngle = index * sliceAngle;
                                    const endAngle = (index + 1) * sliceAngle;
                                    const color = generateColorForSlice(index, options.length);
                                    const isWinner = result === option;

                                    // Calculate text position (middle of slice, at 80% radius)
                                    const textAngle = startAngle + sliceAngle / 2;
                                    const textRadius = 120;
                                    const textPos = polarToCartesian(
                                        200,
                                        200,
                                        textRadius,
                                        textAngle
                                    );

                                    return (
                                        <motion.g
                                            animate={
                                                isWinner
                                                    ? {
                                                          filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))',
                                                          opacity: 1,
                                                      }
                                                    : {
                                                          filter: 'drop-shadow(0 0 0px rgba(255, 255, 255, 0.1))',
                                                          opacity: 0.9,
                                                      }
                                            }
                                            key={`slice-${index}`}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 25,
                                                delay: isWinner ? 0.25 : 0,
                                            }}
                                        >
                                            {/* Slice */}
                                            <path
                                                d={describeArc(
                                                    200,
                                                    200,
                                                    150,
                                                    startAngle,
                                                    endAngle
                                                )}
                                                fill={color}
                                                stroke={'var(--primary)'}
                                                strokeWidth={isWinner ? '5' : '2'}
                                            />

                                            {/* Text */}
                                            <text
                                                className="text-xs font-semibold pointer-events-none select-none"
                                                dominantBaseline="middle"
                                                fill={
                                                    isWinner
                                                        ? 'var(--accent-foreground)'
                                                        : 'var(--foreground)'
                                                }
                                                fontFamily="var(--font-family)"
                                                fontSize={isWinner ? 18 : 13}
                                                fontWeight={isWinner ? 900 : 400}
                                                textAnchor="middle"
                                                x={textPos.x}
                                                y={textPos.y}
                                            >
                                                {truncateString(option, 8)}
                                            </text>
                                        </motion.g>
                                    );
                                })}

                                {/* Center Circle */}
                                <circle
                                    cx="200"
                                    cy="200"
                                    fill="var(--background)"
                                    r="20"
                                    stroke="var(--accent)"
                                    strokeWidth="3"
                                />
                            </g>
                        </svg>
                    </Card>
                ) : (
                    <EmptyData
                        description="Add at least 2 options to spin the wheel"
                        Icon={ShipWheel}
                        title="Not enough options"
                    />
                )}
            </div>
        </div>
    );
}
