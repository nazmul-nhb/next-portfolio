'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, Gauge } from 'lucide-react';
import { useMount } from 'nhb-hooks';
import { Chronos, roundNumber } from 'nhb-toolbox';
import type { TimeUnit } from 'nhb-toolbox/date/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PoweredBy } from '@/app/tools/_components/PoweredBy';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import CodeBlock from '@/components/misc/code-block';
import EmptyData from '@/components/misc/empty-data';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const UNIT_OPTIONS: Array<{ value: TimeUnit; label: string }> = [
    { value: 'millisecond', label: 'Milliseconds' },
    { value: 'second', label: 'Seconds' },
    { value: 'minute', label: 'Minutes' },
    { value: 'hour', label: 'Hours' },
    { value: 'day', label: 'Days' },
    { value: 'week', label: 'Weeks' },
    { value: 'month', label: 'Months' },
    { value: 'year', label: 'Years' },
];

function toDateTimeLocalValue(date = new Date()) {
    const chr = new Chronos(date);
    return chr.toLocalISOString().split('.')[0];
}

function parseDateTimeLocal(value: string) {
    if (!value) return null;
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

const DifferenceCalculatorFormSchema = z
    .object({
        startDateTime: z.string().min(1, 'Start date and time is required.'),
        endDateTime: z.string().min(1, 'End date and time is required.'),
        unit: z.enum([
            'year',
            'month',
            'week',
            'day',
            'hour',
            'minute',
            'second',
            'millisecond',
        ]),
    })
    .superRefine(({ startDateTime, endDateTime }, ctx) => {
        const startDate = parseDateTimeLocal(startDateTime);
        const endDate = parseDateTimeLocal(endDateTime);

        if (!startDate) {
            ctx.addIssue({
                code: 'custom',
                message: 'Enter a valid start date and time.',
                path: ['startDateTime'],
            });
        }

        if (!endDate) {
            ctx.addIssue({
                code: 'custom',
                message: 'Enter a valid end date and time.',
                path: ['endDateTime'],
            });
        }
    });

type DifferenceCalculatorFormValues = z.infer<typeof DifferenceCalculatorFormSchema>;

interface ResultPreviewProps {
    startDate: string;
    endDate: string;
    unit: TimeUnit;
}

function ResultPreview({ startDate, endDate, unit }: ResultPreviewProps) {
    const chr = new Chronos(startDate);

    const getUnitLabel = (u: TimeUnit) => {
        return UNIT_OPTIONS.find((opt) => opt.value === u)?.label || u;
    };

    return (
        <div className="rounded-lg border bg-linear-to-br from-primary/5 via-transparent to-primary/10 p-3 space-y-4">
            <div className="flex items-baseline gap-3">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                    {roundNumber(chr.diff(endDate, unit), 3)}
                </div>
                <div className="text-lg font-semibold text-muted-foreground">
                    {getUnitLabel(unit)}
                </div>
            </div>

            <div className="pt-3 border-t space-y-2">
                <p className="text-xs font-medium text-muted-foreground">ALTERNATIVE UNITS</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {UNIT_OPTIONS.map((option) => {
                        return (
                            <div
                                className="rounded px-2 py-1.5 bg-muted/50 text-center"
                                key={option.value}
                            >
                                <div className="text-xs font-medium text-muted-foreground">
                                    {option.label}
                                </div>
                                <div className="text-sm font-semibold">
                                    {roundNumber(chr.diff(endDate, option.value), 3)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <SmartAlert
                className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100 text-sm"
                description={
                    <span>
                        Positive value means end date is{' '}
                        <span className="font-semibold">after</span> start date. Negative value
                        means end date is <span className="font-semibold">before</span> start
                        date.
                    </span>
                }
            />
        </div>
    );
}

export default function DifferenceCalculator() {
    const form = useForm<DifferenceCalculatorFormValues>({
        resolver: zodResolver(DifferenceCalculatorFormSchema),
        mode: 'all',
        defaultValues: {
            startDateTime: new Chronos().addDays(-30).toLocalISOString().split('.')[0],
            endDateTime: toDateTimeLocalValue(),
            unit: 'day',
        },
    });

    const startDateTime = form.watch('startDateTime');
    const endDateTime = form.watch('endDateTime');
    const unit = form.watch('unit');

    return useMount(
        <div className="space-y-8">
            <TitleWithShare
                description="Calculate precise differences between two moments in any time."
                route="/tools/time-difference"
                title="Time Difference Calculator"
            />
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                <Card className="max-h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="size-5" />
                            Date & Time Range
                        </CardTitle>
                        <CardDescription>
                            Select two moments and choose the unit to calculate the difference
                            between them.
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
                                        name="startDateTime"
                                        render={({ field }) => (
                                            <FormItem className="flex-1 w-full">
                                                <FormLabel>Start Date & Time</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        max={endDateTime || undefined}
                                                        placeholder="Start Date & Time"
                                                        step={1}
                                                        type="datetime-local"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    The reference point (usually earlier date).
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="endDateTime"
                                        render={({ field }) => (
                                            <FormItem className="flex-1 w-full">
                                                <FormLabel>End Date & Time</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        min={startDateTime || undefined}
                                                        placeholder="End Date & Time"
                                                        step={1}
                                                        type="datetime-local"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Defaults to the current local moment.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Calculate Difference In</FormLabel>
                                            <Select
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {UNIT_OPTIONS.map((option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Choose the unit for the calculated difference.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        onClick={() => {
                                            form.reset({
                                                startDateTime: new Chronos()
                                                    .addDays(-30)
                                                    .toLocalISOString()
                                                    .split('.')[0],
                                                endDateTime: toDateTimeLocalValue(),
                                                unit: 'day',
                                            });
                                        }}
                                        type="button"
                                        variant="outline"
                                    >
                                        Reset All
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            form.setValue(
                                                'endDateTime',
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

                        {(!startDateTime || !endDateTime) && (
                            <CodeBlock className="mt-6 text-lg md:text-xl font-semibold text-muted-foreground">
                                Enter both dates to see the calculation result.
                            </CodeBlock>
                        )}

                        <PoweredBy
                            className="mt-6"
                            description="This tool uses Chronos class from my open-source package to calculate date differences."
                            url="https://toolbox.nazmul-nhb.dev/docs/classes/Chronos/calculation#diff"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gauge className="size-5" />
                            Calculated Result
                        </CardTitle>
                        <CardDescription>
                            The difference in your selected unit with conversions to other
                            units.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {startDateTime && endDateTime ? (
                            <ResultPreview
                                endDate={endDateTime}
                                startDate={startDateTime}
                                unit={unit}
                            />
                        ) : (
                            <EmptyData
                                description="Enter both dates and select a unit to see results."
                                Icon={Clock}
                                title="Select Dates"
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
