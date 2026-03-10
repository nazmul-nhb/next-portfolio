'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Globe, Plus, Trash2 } from 'lucide-react';
import { useClock, useMount } from 'nhb-hooks';
import { Chronos } from 'nhb-toolbox';
import { TIME_ZONE_IDS, TIME_ZONES } from 'nhb-toolbox/constants';
import type { $TimeZoneIdentifier, TimeZoneId } from 'nhb-toolbox/date/types';
import { useEffect, useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Generate UTC offsets in 15-minute intervals
const generateUTCOffsets = () => {
    const offsets = [];
    for (let hours = -12; hours <= 14; hours++) {
        for (let minutes = 0; minutes < 60; minutes += 15) {
            if (minutes === 0) {
                const sign = hours >= 0 ? '+' : '';
                const offset = `UTC${sign}${String(hours).padStart(2, '0')}:00`;
                offsets.push({
                    value: offset,
                    label: offset,
                    type: 'UTC' as const,
                });
            } else {
                const sign = hours >= 0 ? '+' : '';
                const offset = `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                offsets.push({
                    value: offset,
                    label: offset,
                    type: 'UTC' as const,
                });
            }
        }
    }
    return offsets;
};

const timeZoneAddFormSchema = z.object({
    timezone: z.string().min(1, 'Please select a timezone.'),
    label: z
        .string()
        .min(1, 'Label is required.')
        .max(30, 'Label must be less than 30 characters.'),
});

type TimeZoneAddFormValues = z.infer<typeof timeZoneAddFormSchema>;

interface TimeZoneEntry {
    id: string;
    timezone: Exclude<TimeZoneId, $TimeZoneIdentifier[]>;
    label: string;
    chronos: Chronos;
}

interface TimeZoneCardProps {
    entry: TimeZoneEntry;
    onRemove: (id: string) => void;
}

function TimeZoneCard({ entry, onRemove }: TimeZoneCardProps) {
    return (
        <Card className="relative">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {entry.label}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {entry.timezone}
                            </p>
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="text-3xl font-bold font-mono">
                                {entry.chronos.format('HH:mm:ss')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {entry.chronos.format('ddd, MMM DD YYYY')}
                            </div>
                            <div className="text-xs font-medium text-muted-foreground">
                                UTC {entry.chronos.utcOffset}
                            </div>
                        </div>

                        <CodeBlock className="text-xs mt-3">
                            {`timeZone('${entry.timezone}')`}
                        </CodeBlock>
                    </div>

                    <Button
                        className="text-destructive hover:text-destructive"
                        onClick={() => onRemove(entry.id)}
                        size="sm"
                        variant="ghost"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function TimezoneConverter() {
    const { time } = useClock();
    const [entries, setEntries] = useState<TimeZoneEntry[]>([]);
    const [utcOffsets] = useState(generateUTCOffsets());

    const form = useForm<TimeZoneAddFormValues>({
        resolver: zodResolver(timeZoneAddFormSchema),
        mode: 'all',
        defaultValues: {
            timezone: 'Asia/Dhaka',
            label: '',
        },
    });

    const handleAddTimezone = (values: TimeZoneAddFormValues) => {
        const tz = values.timezone as Exclude<TimeZoneId, $TimeZoneIdentifier[]>;
        const chronos = new Chronos(time).timeZone(tz);

        const newEntry: TimeZoneEntry = {
            id: `${Date.now()}-${Math.random()}`,
            timezone: tz,
            label: values.label,
            chronos,
        };

        setEntries((prev) => [...prev, newEntry]);
        form.reset();
    };

    const handleRemoveEntry = (id: string) => {
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
    };

    // Update all times whenever the clock updates
    useEffect(() => {
        setEntries((prev) =>
            prev.map((entry) => ({
                ...entry,
                chronos: new Chronos(time).timeZone(entry.timezone),
            }))
        );
    }, [time]);

    return useMount(
        <div className="space-y-8">
            <TitleWithShare
                description="Compare current time across multiple timezones with live updates using Chronos.timeZone() and useClock."
                route="/tools/timezone-converter"
                title="Timezone Converter"
            />

            <div className="grid gap-6">
                {/* Local Time Display */}
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="size-5" />
                            Your Local Time (Live Clock)
                        </CardTitle>
                        <CardDescription>
                            Current time in your timezone - updates every second using useClock
                            hook.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="text-5xl font-bold font-mono">
                                    {new Chronos(time).format('HH:mm:ss')}
                                </div>
                                <div className="text-lg text-muted-foreground">
                                    {new Chronos(time).format('dddd, MMMM DD YYYY')}
                                </div>
                                <div className="text-sm font-medium text-muted-foreground">
                                    {new Chronos(time).$getNativeTimeZoneId()} (
                                    {new Chronos(time).utcOffset})
                                </div>
                            </div>

                            <SmartAlert
                                className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100 text-sm"
                                description={
                                    <span>
                                        This time updates in real-time using the{' '}
                                        <code className="font-cascadia text-xs">useClock</code>{' '}
                                        hook.
                                    </span>
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Add Timezone Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Add Timezone</CardTitle>
                        <CardDescription>
                            Select from IANA identifiers, abbreviations, or custom UTC offsets.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form {...form}>
                            <form
                                className="space-y-6"
                                onSubmit={form.handleSubmit(handleAddTimezone)}
                            >
                                <FormField
                                    control={form.control}
                                    name="label"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Label (e.g., "New York Office")
                                            </FormLabel>
                                            <FormControl>
                                                <input
                                                    placeholder="Enter location name..."
                                                    {...field}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                A friendly name for this timezone location.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="timezone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Timezone</FormLabel>
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
                                                    <div className="max-h-96">
                                                        {/* IANA Identifiers Group */}
                                                        <div className="px-2 py-1.5">
                                                            <p className="text-xs font-semibold text-muted-foreground px-2 mb-2">
                                                                IANA IDENTIFIERS
                                                            </p>
                                                            {Object.keys(TIME_ZONE_IDS).map(
                                                                (id) => (
                                                                    <SelectItem
                                                                        key={id}
                                                                        value={id}
                                                                    >
                                                                        {id}
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </div>

                                                        {/* Abbreviations Group */}
                                                        <div className="px-2 py-1.5">
                                                            <p className="text-xs font-semibold text-muted-foreground px-2 mb-2">
                                                                ABBREVIATIONS
                                                            </p>
                                                            {Object.entries(TIME_ZONES).map(
                                                                ([abbr]) => (
                                                                    <SelectItem
                                                                        key={abbr}
                                                                        value={abbr}
                                                                    >
                                                                        {abbr}
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </div>

                                                        {/* UTC Offsets Group */}
                                                        <div className="px-2 py-1.5">
                                                            <p className="text-xs font-semibold text-muted-foreground px-2 mb-2">
                                                                UTC OFFSETS (15-MIN INTERVALS)
                                                            </p>
                                                            {utcOffsets.map((offset) => (
                                                                <SelectItem
                                                                    key={offset.value}
                                                                    value={offset.value}
                                                                >
                                                                    {offset.label}
                                                                </SelectItem>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Select timezone by IANA identifier,
                                                abbreviation, or UTC offset.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button className="w-full gap-2" type="submit">
                                    <Plus className="size-4" />
                                    Add Timezone
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Timezone Cards Grid */}
                {entries.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Added Timezones</h3>
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {entries.map((entry) => (
                                <TimeZoneCard
                                    entry={entry}
                                    key={entry.id}
                                    onRemove={handleRemoveEntry}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {entries.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="pt-8 text-center pb-8">
                            <Globe className="size-12 mx-auto text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">
                                No timezones added yet. Add one to start comparing times.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Documentation */}
                <Card>
                    <CardHeader>
                        <CardTitle>How It Works</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">
                                Three Types of Timezone Inputs:
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="rounded-lg bg-muted p-3">
                                    <p className="font-mono text-xs">
                                        new Chronos().timeZone('Asia/Dhaka')
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        IANA timezone identifier (recommended for accuracy)
                                    </p>
                                </div>

                                <div className="rounded-lg bg-muted p-3">
                                    <p className="font-mono text-xs">
                                        new Chronos().timeZone('EST')
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Timezone abbreviation (when identifiers are unavailable)
                                    </p>
                                </div>

                                <div className="rounded-lg bg-muted p-3">
                                    <p className="font-mono text-xs">
                                        new Chronos().timeZone('UTC+06:30')
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        UTC offset in 15-minute intervals (for fictional/custom
                                        timezones)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <PoweredBy
                            description="This tool uses Chronos.timeZone() for conversions and useClock for live time updates."
                            url="https://toolbox.nazmul-nhb.dev/docs/classes/Chronos/conversion#timezone"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
