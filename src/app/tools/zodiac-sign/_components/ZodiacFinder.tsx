'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
    Calendar,
    CalendarDays,
    Info,
    type LucideIcon,
    Sparkles,
    ZodiacAquarius,
    ZodiacAries,
    ZodiacCancer,
    ZodiacCapricorn,
    ZodiacGemini,
    ZodiacLeo,
    ZodiacLibra,
    ZodiacPisces,
    ZodiacSagittarius,
    ZodiacScorpio,
    ZodiacTaurus,
    ZodiacVirgo,
} from 'lucide-react';
import { Chronos } from 'nhb-toolbox';
import { MONTHS } from 'nhb-toolbox/constants';
import type { MonthDateString, ZodiacSign } from 'nhb-toolbox/date/types';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const ZODIAC_PRESET_OPTIONS = {
    western: {
        label: 'Western (Tropical)',
        description: 'Commonly used in modern western astrology.',
    },
    vedic: {
        label: 'Vedic (Sidereal)',
        description: 'Used in many traditional Jyotish astrology systems.',
    },
} as const;

const ZODIAC_PRESET_VALUES = ['western', 'vedic'] as const;

const ZODIAC_SIGN_DETAILS = {
    Aries: {
        Icon: ZodiacAries,
        description:
            'Traditionally associated with initiative, directness, and a fast-moving approach to action. Aries profiles are often framed as bold, competitive, and comfortable taking the lead.',
    },
    Taurus: {
        Icon: ZodiacTaurus,
        description:
            'Often described as steady, practical, and comfort-oriented. Taurus themes usually center on consistency, patience, and a preference for dependable routines.',
    },
    Gemini: {
        Icon: ZodiacGemini,
        description:
            'Commonly linked with curiosity, adaptability, and communication. Gemini is typically portrayed as mentally active, versatile, and interested in variety.',
    },
    Cancer: {
        Icon: ZodiacCancer,
        description:
            'Traditionally connected with emotional sensitivity, protectiveness, and strong ties to home or family life. Cancer narratives often emphasize care, memory, and intuition.',
    },
    Leo: {
        Icon: ZodiacLeo,
        description:
            'Usually presented as expressive, warm, and confident. Leo symbolism often highlights visibility, generosity, and a desire to create or lead with presence.',
    },
    Virgo: {
        Icon: ZodiacVirgo,
        description:
            'Often associated with analysis, precision, and service. Virgo profiles are commonly described as observant, organized, and attentive to practical improvement.',
    },
    Libra: {
        Icon: ZodiacLibra,
        description:
            'Traditionally tied to balance, diplomacy, and relationship awareness. Libra is often framed as thoughtful about harmony, fairness, and social presentation.',
    },
    Scorpio: {
        Icon: ZodiacScorpio,
        description:
            'Common descriptions focus on intensity, privacy, and emotional depth. Scorpio themes frequently include resilience, focus, and strong all-or-nothing instincts.',
    },
    Sagittarius: {
        Icon: ZodiacSagittarius,
        description:
            'Often linked with exploration, candor, and big-picture thinking. Sagittarius is typically described as freedom-seeking, optimistic, and motivated by discovery.',
    },
    Capricorn: {
        Icon: ZodiacCapricorn,
        description:
            'Traditionally associated with discipline, long-term planning, and responsibility. Capricorn narratives usually emphasize structure, ambition, and measured progress.',
    },
    Aquarius: {
        Icon: ZodiacAquarius,
        description:
            'Commonly portrayed as independent, future-facing, and idea-driven. Aquarius themes often center on originality, systems thinking, and unconventional perspectives.',
    },
    Pisces: {
        Icon: ZodiacPisces,
        description:
            'Often described as imaginative, empathetic, and emotionally receptive. Pisces symbolism usually points to creativity, intuition, and porous emotional boundaries.',
    },
} satisfies Record<ZodiacSign, { Icon: LucideIcon; description: string }>;

function parseDateOnly(value: string) {
    if (!value) return null;

    const parsedDate = new Date(value);

    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function formatMonthDay(monthDate: MonthDateString) {
    const [month, date] = monthDate.split('-').map(Number);

    return `${MONTHS[month - 1]} ${date}`;
}

const ZodiacFinderFormSchema = z
    .object({
        birthDate: z.string().min(1, 'Birth date is required.'),
        preset: z.enum(ZODIAC_PRESET_VALUES),
    })
    .superRefine(({ birthDate }, ctx) => {
        const parsedBirthDate = parseDateOnly(birthDate);

        if (birthDate && !parsedBirthDate) {
            ctx.addIssue({
                code: 'custom',
                message: 'Enter a valid birth date.',
                path: ['birthDate'],
            });
        }
    });

type ZodiacFinderFormValues = z.infer<typeof ZodiacFinderFormSchema>;

export default function ZodiacFinder() {
    const form = useForm<ZodiacFinderFormValues>({
        resolver: zodResolver(ZodiacFinderFormSchema),
        mode: 'onChange',
        defaultValues: {
            birthDate: '',
            preset: 'western',
        },
    });

    const birthDate = form.watch('birthDate');
    const preset = form.watch('preset');

    const selectedPreset = ZODIAC_PRESET_OPTIONS[preset];

    const zodiacResult = useMemo(() => {
        if (!birthDate) return null;

        const chronos = new Chronos(birthDate);
        const sign = chronos.getZodiacSign({ preset });
        const meta = chronos.getZodiacMeta(sign, { preset });
        const details = ZODIAC_SIGN_DETAILS[sign];

        return { chronos, sign, meta, details };
    }, [preset, birthDate]);

    return (
        <div className="space-y-8">
            <div className="max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tight">Zodiac Sign Finder</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Pick a birth date and zodiac system to see the matching sign, its date
                    range, and a concise traditional description.
                </p>
            </div>

            <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100 select-none">
                <Info />
                <AlertTitle>Interpretation Note</AlertTitle>
                <AlertDescription>
                    Zodiac systems are cultural and entertainment frameworks rather than
                    scientific tools.
                    <br />
                    This finder is best used for light, tradition-based reference, not as a
                    reliable measure of personality, compatibility, or future outcomes.
                </AlertDescription>
            </Alert>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarDays className="size-5" />
                            Birth Date Input
                        </CardTitle>
                        <CardDescription>
                            This follows the same tool layout and form conventions as the age
                            calculator, with a date-only field and a shadcn select for zodiac
                            presets.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form {...form}>
                            <form
                                className="space-y-6"
                                onSubmit={(event) => event.preventDefault()}
                            >
                                <div className="flex items-start flex-col flex-wrap gap-4 md:flex-row">
                                    <FormField
                                        control={form.control}
                                        name="birthDate"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Birth Date</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        // max={toDateInputValue()}
                                                        type="date"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    <Alert>
                                                        <Info />
                                                        <AlertDescription>
                                                            Use the actual birth date. Time is
                                                            not needed for this tool.
                                                        </AlertDescription>
                                                    </Alert>{' '}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="preset"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Zodiac Preset</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a preset" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.entries(
                                                            ZODIAC_PRESET_OPTIONS
                                                        ).map(([preset, option]) => (
                                                            <SelectItem
                                                                key={preset}
                                                                value={preset}
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    <Alert>
                                                        <Info />
                                                        <AlertDescription>
                                                            Western uses tropical boundaries.
                                                            <br />
                                                            Vedic uses sidereal boundaries.
                                                        </AlertDescription>
                                                    </Alert>
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        onClick={() => {
                                            form.reset({
                                                birthDate: '',
                                                preset: 'western',
                                            });
                                        }}
                                        type="button"
                                        variant="outline"
                                    >
                                        Reset Inputs
                                    </Button>
                                </div>
                            </form>
                        </Form>

                        <Alert className="mt-6 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100 select-none">
                            <Info />
                            <AlertTitle className="uppercase">Preset</AlertTitle>
                            <AlertDescription>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground"></p>
                                    <p className="mt-2 text-sm font-medium">
                                        {selectedPreset.label}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {selectedPreset.description}
                                    </p>
                                </div>
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="size-5" />
                            Matching Sign
                        </CardTitle>
                        <CardDescription>
                            Result updates as soon as the birth date and preset are valid.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {zodiacResult ? (
                            <div className="space-y-4">
                                <div className="rounded-xl border bg-muted/20 p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <zodiacResult.details.Icon className="size-8" />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                                                {selectedPreset.label}
                                            </p>
                                            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                                                {zodiacResult.sign}
                                            </h2>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Active from{' '}
                                                <span className="bg-primary/20 px-1 rounded">
                                                    {formatMonthDay(zodiacResult.meta.start)} to{' '}
                                                    {formatMonthDay(zodiacResult.meta.end)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border bg-muted/20 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Birth Date
                                    </p>
                                    <p className="mt-2 text-sm font-medium">
                                        {zodiacResult.chronos.toLocaleString('en-US', {
                                            dateStyle: 'full',
                                        })}
                                    </p>
                                </div>

                                <div className="rounded-lg border bg-muted/20 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Traditional Description
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {zodiacResult.details.description}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <Empty className="border border-dashed">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Calendar />
                                    </EmptyMedia>
                                    <EmptyTitle>Select a birth date</EmptyTitle>
                                    <EmptyDescription>
                                        Select a birth date and preset to see the matching
                                        zodiac sign, its date window, and a short traditional
                                        description.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
