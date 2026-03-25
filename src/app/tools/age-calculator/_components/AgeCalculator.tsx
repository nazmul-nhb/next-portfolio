'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Braces, CalendarClock } from 'lucide-react';
import { useMount } from 'nhb-hooks';
import { Chronos } from 'nhb-toolbox';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PoweredBy } from '@/app/tools/_components/PoweredBy';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import CodeBlock from '@/components/misc/code-block';
import SmartAlert from '@/components/misc/smart-alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { cn, parseDateTimeLocal, toDateTimeLocalValue } from '@/lib/utils';
import type { Uncertain } from '@/types';

const AgeCalculatorFormSchema = z
    .object({
        birthDateTime: z.string().min(1, 'Birth date and time is required.'),
        untilDateTime: z.string().min(1, 'Comparison date and time is required.'),
    })
    .superRefine(({ birthDateTime, untilDateTime }, ctx) => {
        const birthDate = parseDateTimeLocal(birthDateTime);
        const untilDate = parseDateTimeLocal(untilDateTime);

        if (!birthDate) {
            ctx.addIssue({
                code: 'custom',
                message: 'Enter a valid birth date and time.',
                path: ['birthDateTime'],
            });
        }

        if (!untilDate) {
            ctx.addIssue({
                code: 'custom',
                message: 'Enter a valid comparison date and time.',
                path: ['untilDateTime'],
            });
        }

        if (birthDate && untilDate && birthDate > untilDate) {
            ctx.addIssue({
                code: 'custom',
                message: 'The comparison date must be after the birth date.',
                path: ['untilDateTime'],
            });
        }
    });

type AgeCalculatorFormValues = z.infer<typeof AgeCalculatorFormSchema>;

interface ParsedDatePreviewProps {
    label: string;
    value: string;
    chronos: Uncertain<Chronos>;
}

function ParsedDatePreview({ label, value, chronos }: ParsedDatePreviewProps) {
    return (
        <div className="rounded-lg border bg-muted/20 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {chronos ? chronos.format() : 'null'}
                    </p>
                </div>
                <span
                    className={cn('rounded-full border px-2 py-0.5 text-[11px] font-medium', {
                        'border-green-500/50 bg-green-500/10 text-green-700': chronos,
                        'border-red-500/50 bg-red-800/10 text-red-700': !chronos,
                    })}
                >
                    {chronos ? 'Ready' : 'Missing'}
                </span>
            </div>

            <div className="mt-4 space-y-3">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Form Value</p>
                    <CodeBlock>{value || 'null'}</CodeBlock>
                </div>

                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Native Date</p>
                    <CodeBlock>{chronos ? chronos.toLocalISOString() : 'null'}</CodeBlock>
                </div>

                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">ISO Snapshot</p>
                    <CodeBlock>{chronos ? chronos.toISOString() : 'null'}</CodeBlock>
                </div>
            </div>
        </div>
    );
}

export default function AgeCalculator() {
    const form = useForm<AgeCalculatorFormValues>({
        resolver: zodResolver(AgeCalculatorFormSchema),
        mode: 'all',
        defaultValues: {
            birthDateTime: new Chronos().addYears(-1).toLocalISOString().split('.')[0],
            untilDateTime: toDateTimeLocalValue(),
        },
    });

    const birthDateTime = form.watch('birthDateTime');
    const untilDateTime = form.watch('untilDateTime');

    const birthChronos = new Chronos(birthDateTime || undefined);
    const untilChronos = new Chronos(untilDateTime || undefined);

    const age = birthChronos.durationString({
        toTime: untilDateTime || undefined,
        maxUnits: 6,
        separator: ' - ',
    });

    return useMount(
        <div className="space-y-8">
            <TitleWithShare
                description="Capture an exact birth moment and comparison moment with full local date-time precision."
                route="/tools/age-calculator"
                title="Age Calculator"
            />
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                <Card className="max-h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarClock className="size-5" />
                            Input Range
                        </CardTitle>
                        <CardDescription>
                            This follows the existing project pattern for date fields, but uses{' '}
                            <code className="font-cascadia text-xs">datetime-local</code> with
                            second precision so you can preserve detailed time data.
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
                                        name="birthDateTime"
                                        render={({ field }) => (
                                            <FormItem className="flex-1 w-full">
                                                <FormLabel>Birth Date & Time</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        max={untilDateTime || undefined}
                                                        placeholder="Birth Date & Time"
                                                        step={1}
                                                        type="datetime-local"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Enter the exact birth moment if you have it.
                                                    The field keeps seconds-level precision.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="untilDateTime"
                                        render={({ field }) => (
                                            <FormItem className="flex-1 w-full">
                                                <FormLabel>Until Date & Time</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        min={birthDateTime || undefined}
                                                        placeholder="Until Date & Time"
                                                        step={1}
                                                        type="datetime-local"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Defaults to the current local moment.
                                                    Override it for historical or future
                                                    comparisons.
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
                                                birthDateTime: '',
                                                untilDateTime: toDateTimeLocalValue(),
                                            });
                                        }}
                                        type="button"
                                        variant="outline"
                                    >
                                        Reset Inputs
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            form.setValue(
                                                'untilDateTime',
                                                toDateTimeLocalValue(),
                                                {
                                                    shouldDirty: true,
                                                    shouldTouch: true,
                                                    shouldValidate: true,
                                                }
                                            );
                                        }}
                                        type="button"
                                    >
                                        Use Current Moment
                                    </Button>
                                </div>
                            </form>
                        </Form>

                        <CodeBlock className="mt-6 text-lg md:text-xl font-semibold">
                            {birthDateTime
                                ? age
                                : 'Enter your birth date and time to see the calculation result.'}
                        </CodeBlock>

                        <SmartAlert
                            className="my-6 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100 select-none"
                            description={
                                <span>
                                    Values are interpreted in{' '}
                                    <span className="font-bold">
                                        {birthChronos.$getNativeTimeZoneId()}
                                    </span>{' '}
                                    ({birthChronos.utcOffset}).
                                </span>
                            }
                        />
                        <PoweredBy
                            description="This tool uses Chronos class from my open-source package to calculate age."
                            url="https://toolbox.nazmul-nhb.dev/docs/classes/Chronos/calculation#durationstring"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Braces className="size-5" />
                            Parsed Date Preview
                        </CardTitle>
                        <CardDescription>
                            Live snapshots of the exact values this UI normalizes for downstream
                            age calculation logic.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <ParsedDatePreview
                            chronos={birthDateTime ? birthChronos : null}
                            label="Birth Moment"
                            value={birthDateTime}
                        />
                        <ParsedDatePreview
                            chronos={untilDateTime ? untilChronos : null}
                            label="Comparison Moment"
                            value={untilDateTime}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
