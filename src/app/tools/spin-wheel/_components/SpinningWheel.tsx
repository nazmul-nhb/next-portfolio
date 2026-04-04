'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BrushCleaning, Plus, ShipWheel, Shuffle, SquareMenu, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMount, useStorage } from 'nhb-hooks';
import {
    clampNumber,
    generateQueryParams,
    getRandomNumber,
    isNonEmptyString,
    shuffleArray,
    throttleAction,
    trimString,
    truncateString,
} from 'nhb-toolbox';
import type { HSL } from 'nhb-toolbox/colors/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
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
import { siteConfig } from '@/configs/site';
import { cipher, cn } from '@/lib/utils';

const DEFAULT_OPTIONS = [
    ['Elysium', 'Tartarus', 'Olympus', 'Aether', 'Styx', 'Arcadia', 'Lethe', 'Nyx'],
    ['Obelisk', 'Sphinx', 'Pyramid', 'Cartouche', 'Papyrus', 'Scarab', 'Ankh', 'Canopic'],
    ['Oracle', 'Labyrinth', 'Chimera', 'Pegasus', 'Gorgon', 'Titan', 'Cyclops', 'Hydra'],
    ['Legion', 'Imperium', 'Colosseum', 'Centurion', 'Senate', 'Tribune', 'Aquila', 'Gladius'],
    ['Requiem', 'Ascension', 'Eclipse', 'Sanctum', 'Relic', 'Mythos', 'Dominion', 'Omen'],
    ['Catacomb', 'Pantheon', 'Vortex', 'Abyss', 'Ember', 'Sigil', 'Runic', 'Totem'],
    ['Harbinger', 'Vanguard', 'Sentinel', 'Warden', 'Phantom', 'Specter', 'Eidolon', 'Shade'],
    ['Monolith', 'Keystone', 'Pillar', 'Vault', 'Citadel', 'Spire', 'Bastion', 'Sanctorum'],
    ['Inferno', 'Tempest', 'Zephyr', 'Torrent', 'Quasar', 'Nova', 'Eon', 'Flux'],
    ['Chronos', 'Kairos', 'Aion', 'Epoch', 'Era', 'Continuum', 'Paradox', 'Moment'],
    ['Glyph', 'Rune', 'Cipher', 'Scroll', 'Codex', 'Tablet', 'Insignia', 'Talisman'],
    ['Nemesis', 'Fate', 'Kismet', 'Destiny', 'Fortune', 'Providence', 'Doom', 'Judgment'],
    ['Aurelian', 'Valerian', 'Octavian', 'Severan', 'Flavian', 'Hadrian', 'Trajan', 'Lucian'],
    ['Helios', 'Selene', 'Erebus', 'Hemera', 'Thanatos', 'Hypnos', 'Kratos', 'Nike'],
    ['Sarcophagus', 'Necropolis', 'Mausoleum', 'Sepulcher', 'Crypt', 'Tomb', 'Grave', 'Barrow'],
    ['Aurora', 'Dusk', 'Nocturne', 'Solstice', 'Equinox', 'Zenith', 'Nadir', 'Horizon'],
    ['Asmodeus', 'Beelzebub', 'Mammon', 'Belial', 'Abaddon', 'Azazel', 'Astaroth', 'Lilith'],
    ['Ifrit', 'Marid', 'Ghoul', 'Qareen', 'Nasnas', 'Sihr', 'Jinn', 'Shaytan'],
    ['Rakshasa', 'Asura', 'Vetala', 'Pishacha', 'Daitya', 'Danava', 'Naraka', 'Kali'],
    ['Oni', 'Tengu', 'Kappa', 'Yokai', 'Jorogumo', 'Nue', 'Gashadokuro', 'Akaname'],
    ['Typhon', 'Echidna', 'Empusa', 'Lamia', 'Mormo', 'Keres', 'Erinyes', 'Gorgons'],
    ['Apep', 'Ammit', 'Ammut', 'Set', 'Babi', 'Sekhmet', 'Serpopard', 'Nehebkau'],
    ['Cerberus', 'Orthrus', 'Scylla', 'Charybdis', 'Harpies', 'Furies', 'Eidolons', 'Phantoms'],
    ['Tartarus', 'Stygian', 'Acheron', 'Cocytus', 'Styx', 'Erebus', 'Tenebris', 'Infernum'],
];

const randomizeOptions = () => {
    const randomIndex = getRandomNumber({ max: DEFAULT_OPTIONS.length - 1 });
    return shuffleArray(DEFAULT_OPTIONS)[randomIndex];
};

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
    const router = useRouter();
    const [optionInput, setOptionInput] = useState('');
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<string | null>(null);
    const [hoveredSliceIndex, setHoveredSliceIndex] = useState<number | null>(null);
    const animationRef = useRef<number | null>(null);

    // Load options from storage or URL params
    const optionsStore = useStorage<string[]>({ key: 'nhb-spin-wheel' });

    const [options, setOptions] = useState<string[]>(randomizeOptions());

    const syncOptionsResult = useCallback(
        (values: string[]) => {
            setOptions(values);
            optionsStore.set(values);
            setResult(null);
            setRotation(0);

            if (searchParams.has('items')) {
                router.push('/tools/spin-wheel');
                setOptions(values);
                optionsStore.set(values);
            }
        },
        [optionsStore.set, searchParams, router.push]
    );

    // Initialize from URL params or storage on mount
    useEffect(() => {
        const itemsParam = searchParams.get('items');

        if (isNonEmptyString(itemsParam)) {
            try {
                const decoded = cipher.decrypt(itemsParam);

                const urlOptions = trimString(decoded.split(','));

                if (urlOptions.length >= 2) {
                    if (urlOptions.length > 36) {
                        toast.error('Maximum 36 options allowed, removing extra options!');
                        setOptions(urlOptions.slice(0, 36));
                        return;
                    }

                    setOptions(urlOptions);

                    return;
                }
            } catch {
                toast.error('Invalid wheel configuration in URL, loading defaults!');
                setOptions(randomizeOptions());
                return;
            }
        }

        if (optionsStore.value && optionsStore.value.length > 1) {
            if (optionsStore.value.length > 36) {
                toast.error('Maximum 36 options allowed, removing extra options!');
                setOptions(optionsStore.value.slice(0, 36));
                return;
            }

            setOptions(optionsStore.value);
        }
    }, [searchParams, optionsStore.value]);

    const handleAddOption = () => {
        const trimmed = trimString(optionInput);

        if (!trimmed) {
            toast.error('Please enter an option');
            return;
        }

        if (trimmed.length > 16) {
            toast.error('Please keep the option below 16 characters');
            return;
        }

        if (options.some((o) => o.toLowerCase() === trimmed.toLowerCase())) {
            toast.error('This option already exists');
            return;
        }

        if (options.length > 36) {
            toast.error('Maximum 36 options allowed!');
            return;
        }

        const newOptions = [trimmed, ...options];

        syncOptionsResult(newOptions);

        setOptionInput('');
        toast.success('Option added to the wheel');
    };

    const handleRemoveOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        syncOptionsResult(newOptions);
        toast.success('Option removed from the wheel');
    };

    const handleShuffle = () => {
        const shuffled = shuffleArray(options);
        syncOptionsResult(shuffled);
        toast.success('Wheel options are reordered');
    };

    const handleReset = () => {
        syncOptionsResult(randomizeOptions());
        toast.success('Wheel options are reset to random defaults');
    };

    const clearOptions = () => {
        syncOptionsResult([]);
        toast.success('Wheel options are cleared');
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
        const duration = clampNumber(options.length * 1000, 5000, 10000);

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

                // Calculate which slice is at the pointer (top)
                // The pointer is fixed at the top, so we find which slice aligns with it
                const winnerIndex =
                    Math.floor((360 - normalizedRotation) / sliceAngle) % options.length;

                setResult(options[winnerIndex]);
                setSpinning(false);
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    };

    const sharableLink = useMemo(() => {
        if (options.length < 2) return '/tools/spin-wheel';

        const encrypted = cipher.encrypt(options.join(','));

        const query = generateQueryParams({ items: encrypted });

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
                {/* Left Column */}
                <div className="space-y-4">
                    {/* Options Input */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shuffle className="size-5" />
                                Add Options
                            </CardTitle>
                            <CardDescription>
                                Add options to your wheel (minimum 2 required, maximum 36
                                allowed)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    disabled={options.length >= 36}
                                    onChange={(e) => setOptionInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddOption();
                                    }}
                                    placeholder="Enter an option (maximum 16 characters)"
                                    value={optionInput}
                                />
                                <Button
                                    disabled={options.length >= 36}
                                    onClick={handleAddOption}
                                    size="lg"
                                >
                                    <Plus className="size-4" /> Add
                                </Button>
                            </div>
                            <h3 className="font-medium text-base flex items-center gap-2">
                                <SquareMenu className="size-4 mb-0.5" /> Options (
                                {options.length})
                            </h3>
                            <motion.div
                                className="space-y-2 h-58 overflow-y-auto overflow-x-hidden custom-scroll pr-2"
                                layout
                            >
                                <AnimatePresence>
                                    {options.length > 0 ? (
                                        options.map((option, index) => (
                                            <motion.div
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center justify-between p-2 rounded-md bg-muted/50 border"
                                                exit={{ opacity: 0, y: -12 }}
                                                initial={{ opacity: 0, y: 12 }}
                                                key={option}
                                                layout
                                                transition={{
                                                    layout: {
                                                        duration: 0.25,
                                                        ease: 'easeInOut',
                                                    },
                                                    opacity: { duration: 0.18 },
                                                    y: { duration: 0.18 },
                                                }}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div
                                                        className="size-3 rounded-full shrink-0"
                                                        style={{
                                                            backgroundColor:
                                                                generateColorForSlice(
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
                                        ))
                                    ) : (
                                        <EmptyData
                                            description="Add at least 2 options to spin the wheel"
                                            Icon={Plus}
                                            title="Add Options"
                                        />
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            className="px-3 shrink-0"
                            disabled={spinning || options.length < 2}
                            onClick={handleShuffle}
                            size="lg"
                            variant="outline"
                        >
                            <Shuffle className="size-4" />
                            Shuffle
                        </Button>
                        <Button
                            className="px-3 shrink-0"
                            disabled={spinning}
                            onClick={throttleAction(handleReset, 1000)}
                            size="lg"
                            variant="secondary"
                        >
                            <GiPerspectiveDiceSixFacesRandom className="size-4 mb-0.5" />
                            Random Options
                        </Button>
                        <Button
                            className="px-3 shrink-0"
                            disabled={spinning || searchParams.has('items')}
                            onClick={clearOptions}
                            size="lg"
                            variant="destructive"
                        >
                            <BrushCleaning className="size-4 mb-0.5" />
                            Clear Options
                        </Button>
                        <Button
                            className="text-base px-3 shrink-0 font-semibold"
                            disabled={spinning || options.length < 2}
                            onClick={handleSpin}
                            size="lg"
                        >
                            <ShipWheel
                                className={cn('size-5', {
                                    'animate-spin': spinning,
                                })}
                            />
                            Spin the Wheel
                        </Button>
                    </div>

                    {/* Result Display */}
                    <AnimatePresence mode="wait">
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
                                        <CodeBlock className="text-center text-xl flex items-center justify-center font-black">
                                            {result ? (
                                                `🎉 Winner: ${result}`
                                            ) : spinning ? (
                                                <span className="flex items-center gap-2">
                                                    <ShipWheel className="animate-spin" />
                                                    Spinning...
                                                </span>
                                            ) : options.length >= 2 ? (
                                                'Spin to Get Your Result'
                                            ) : (
                                                'Add Options to Spin the Wheel'
                                            )}
                                        </CodeBlock>
                                    </div>
                                    <div className="flex gap-2 items-center flex-wrap">
                                        <CopyButton
                                            buttonProps={{ disabled: !result }}
                                            buttonText={{
                                                after: 'Result Copied',
                                                before: 'Copy Result',
                                            }}
                                            className="flex-1 w-full"
                                            size="lg"
                                            successMsg="Result copied to clipboard!"
                                            textToCopy={result || ''}
                                        />
                                        <ShareButton
                                            buttonLabel="Share Wheel"
                                            buttonProps={{ size: 'lg' }}
                                            className="text-base flex-1 w-full"
                                            route={sharableLink}
                                            shareLabel="Share current wheel"
                                            shareText="Make random decision with this custom spinning wheel"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Column */}
                {options.length >= 2 ? (
                    <Card className="w-full min-h-fit relative overflow-visible p-0">
                        {/* Fixed Pointer at top */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                            {/* Arrow Triangle */}
                            <div
                                className="size-0"
                                style={{
                                    borderLeft: '20px solid transparent',
                                    borderRight: '20px solid transparent',
                                    borderTop: '36px solid var(--primary)',
                                }}
                            />
                            {/* Arrow Stick */}
                            {/* <div className="w-1 h-3 -mt-1 bg-primary" /> */}
                        </div>

                        {/* SVG Wheel */}
                        <svg
                            className="size-full max-h-fit"
                            preserveAspectRatio="xMidYMid meet"
                            style={{ aspectRatio: '1 / 1', minHeight: '300px' }}
                            viewBox="0 0 400 400"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <title>Spinning Wheel by {siteConfig.name}</title>
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
                                    const isHovered = hoveredSliceIndex === index;

                                    // Calculate text position (middle of slice, at 80% radius)
                                    const textAngle = startAngle + sliceAngle / 2;

                                    const textPos = polarToCartesian(200, 200, 88, textAngle);

                                    const arc = describeArc(
                                        200,
                                        200,
                                        150,
                                        startAngle,
                                        endAngle
                                    );

                                    // const textRotation =
                                    //     textAngle > 90 && textAngle < 270
                                    //         ? textAngle + 270
                                    //         : textAngle + 90;

                                    return (
                                        <motion.g
                                            animate={
                                                isWinner
                                                    ? {
                                                          filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))',
                                                          opacity: 1,
                                                      }
                                                    : isHovered
                                                      ? {
                                                            filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.6))',
                                                            opacity: 1,
                                                        }
                                                      : {
                                                            filter: 'drop-shadow(0 0 0px rgba(255, 255, 255, 0.1))',
                                                            opacity: 0.85,
                                                        }
                                            }
                                            initial={{ opacity: 0 }}
                                            key={`${option}-slice`}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 25,
                                                delay: isWinner ? 0.25 : 0,
                                            }}
                                        >
                                            {/* Slice */}
                                            <path
                                                d={arc}
                                                fill={color}
                                                onMouseEnter={() =>
                                                    !spinning && setHoveredSliceIndex(index)
                                                }
                                                onMouseLeave={() => setHoveredSliceIndex(null)}
                                                stroke={'var(--primary)'}
                                                strokeWidth={
                                                    isWinner ? '4.5' : isHovered ? '3.5' : '2'
                                                }
                                                style={{
                                                    cursor: !spinning ? 'pointer' : 'default',
                                                    transition:
                                                        'stroke-width 0.2s ease, stroke 0.2s ease',
                                                }}
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
                                                transform={`rotate(${textAngle + 90} ${textPos.x} ${textPos.y})`}
                                                // transform={`rotate(${textRotation} ${textPos.x} ${textPos.y})`}
                                                x={textPos.x}
                                                y={textPos.y}
                                            >
                                                {truncateString(option, 12)}
                                            </text>
                                        </motion.g>
                                    );
                                })}

                                {/* Center Circle */}
                                <motion.g
                                    onClick={handleSpin}
                                    style={{
                                        cursor: 'pointer',
                                        transformOrigin: '200px 200px',
                                    }}
                                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.92 }}
                                >
                                    {/* Outer hub */}
                                    <circle
                                        cx="200"
                                        cy="200"
                                        fill="var(--background)"
                                        r="22"
                                        stroke="var(--primary)"
                                        strokeWidth="3"
                                    />

                                    {/* Inner highlight */}
                                    <circle
                                        cx="200"
                                        cy="200"
                                        fill="var(--background)"
                                        opacity="0.18"
                                        r="16"
                                    />

                                    {/* Lucide ShipWheel icon */}
                                    <foreignObject
                                        height="32"
                                        pointerEvents="none"
                                        width="32"
                                        x="184"
                                        y="184"
                                    >
                                        <div className="flex items-center justify-center size-full">
                                            <ShipWheel className="size-8" />
                                        </div>
                                    </foreignObject>
                                </motion.g>
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
