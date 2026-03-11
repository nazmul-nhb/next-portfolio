'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ClockPlus, Globe, GlobeLock, Trash2 } from 'lucide-react';
import { useClock, useMount, useStorage } from 'nhb-hooks';
import { type Chronos, convertStringCase, extractObjectKeys, isValidArray } from 'nhb-toolbox';
import { TIME_ZONE_IDS, TIME_ZONES } from 'nhb-toolbox/constants';
import type { $TimeZoneIdentifier, TimeZone, UTCOffset } from 'nhb-toolbox/date/types';
import { uuid } from 'nhb-toolbox/hash';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PoweredBy } from '@/app/tools/_components/PoweredBy';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import EmptyData from '@/components/misc/empty-data';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
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

// Generate UTC offsets in 15-minute intervals
const generateUTCOffsets = () => {
    const offsets = [];
    for (let hours = -12; hours <= 14; hours++) {
        for (let minutes = 0; minutes < 60; minutes += 15) {
            if (minutes === 0) {
                const sign = hours >= 0 ? '+' : '';
                const offset = `UTC${sign}${String(hours).padStart(2, '0')}:00`;
                offsets.push(offset);
            } else {
                const sign = hours >= 0 ? '+' : '';
                const offset = `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                offsets.push(offset);
            }
        }
    }
    return offsets;
};

const utcOffsets = generateUTCOffsets();

const TZ_OPTIONS = {
    timezoneIdentifier: [...new Set(Object.keys(TIME_ZONE_IDS))],
    timezoneName: [...new Set(Object.keys(TIME_ZONES))] as TimeZone[],
    UTCOffset: [...new Set(utcOffsets)],
};

const TZ_TYPE_OPTIONS = extractObjectKeys(TZ_OPTIONS, true);

const timeZoneAddFormSchema = z.object({
    tzType: z.enum(TZ_TYPE_OPTIONS),
    timezone: z.string().min(1, 'Please select a timezone.'),
    label: z
        .string()
        .min(1, 'Label is required.')
        .max(64, 'Label must be less than 30 characters.'),
});

type TimeZoneAddFormValues = z.infer<typeof timeZoneAddFormSchema>;

type ValidTimeZone = TimeZone | $TimeZoneIdentifier | UTCOffset;

interface TimeZoneEntry {
    id: string;
    timezone: ValidTimeZone;
    label: string;
}

export default function TimezoneConverter() {
    const [timeZoneOptions, settimeZoneOptions] = useState(TZ_OPTIONS.timezoneIdentifier);

    const { time } = useClock({ interval: 'frame' });

    const store = useStorage<TimeZoneEntry[]>({ key: 'nhb-timezone' });

    const form = useForm<TimeZoneAddFormValues>({
        resolver: zodResolver(timeZoneAddFormSchema),
        mode: 'all',
        defaultValues: {
            tzType: 'timezoneIdentifier',
            timezone: time.$getNativeTimeZoneId(),
            label: time.$getNativeTimeZoneId(),
        },
    });

    const tzType = form.watch('tzType');

    const handleAddTimezone = (values: TimeZoneAddFormValues) => {
        const tz = values.timezone as ValidTimeZone;

        const newEntry: TimeZoneEntry = {
            id: uuid(),
            timezone: tz,
            label: values.label,
        };

        store.set(store.value ? [...store.value, newEntry] : [newEntry]);

        form.reset();
    };

    const handleRemoveEntry = (id: string) => {
        if (store.value) {
            store.set(store.value.filter((entry) => entry.id !== id));
        }
    };

    const timezone = form.watch('timezone');

    useEffect(() => {
        const currentLabel = form.getValues('label');

        if (!form.formState.dirtyFields.label || !currentLabel) {
            form.setValue('label', timezone, {
                shouldValidate: true,
                shouldDirty: false,
            });
        }
    }, [timezone, form]);

    useEffect(() => {
        settimeZoneOptions(TZ_OPTIONS[tzType]);

        form.setValue('timezone', timeZoneOptions[0], {
            shouldValidate: true,
            shouldDirty: false,
        });
    }, [tzType, form.setValue, timeZoneOptions[0]]);

    return useMount(
        <div className="space-y-8">
            <TitleWithShare
                description="Compare current time across multiple timezones with live updates."
                route="/tools/timezone-converter"
                title="Timezone Converter"
            />

            <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                <div className="space-y-5">
                    {/* Local Time Display */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="size-5" />
                                Your Local Time
                            </CardTitle>
                            <CardDescription>Current time in your timezone.</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="text-5xl font-bold font-mono">
                                        {time.format('HH:mm:ss')}
                                    </div>
                                    <div className="text-lg text-muted-foreground">
                                        {time.format('ddd, mmmm DD, YYYY')}
                                    </div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        {time.$getNativeTimeZoneId()} ({time.utcOffset})
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add Timezone Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClockPlus className="size-4" /> Add Timezone
                            </CardTitle>
                            <CardDescription>
                                Select from IANA identifiers, abbreviations, or custom UTC
                                offsets.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <Form {...form}>
                                <form
                                    className="space-y-6"
                                    onSubmit={form.handleSubmit(handleAddTimezone)}
                                >
                                    <div className="flex gap-2 flex-col sm:flex-row md:flex-col lg:flex-row flex-wrap items-start w-full">
                                        <FormField
                                            control={form.control}
                                            name="tzType"
                                            render={({ field }) => (
                                                <FormItem className="flex-1 w-full">
                                                    <FormLabel>Timezone Selector</FormLabel>
                                                    <Select
                                                        {...field}
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="w-full">
                                                            {TZ_TYPE_OPTIONS.map((option) => (
                                                                <SelectItem
                                                                    key={option}
                                                                    value={option}
                                                                >
                                                                    {convertStringCase(
                                                                        option,
                                                                        'Title Case',
                                                                        {
                                                                            preserveAcronyms: true,
                                                                        }
                                                                    )}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        Select timezone selector type, e.g.,
                                                        IANA identifier, abbreviation, or UTC
                                                        offset.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="timezone"
                                            render={({ field }) => (
                                                <FormItem className="flex-1 w-full">
                                                    <FormLabel>Timezone</FormLabel>
                                                    <Combobox
                                                        items={timeZoneOptions}
                                                        {...field}
                                                        onValueChange={field.onChange}
                                                        value={field.value || ''}
                                                    >
                                                        <FormControl>
                                                            <ComboboxInput
                                                                placeholder="Select timezone"
                                                                showClear
                                                            />
                                                        </FormControl>

                                                        <ComboboxContent>
                                                            <ComboboxEmpty>
                                                                No items found.
                                                            </ComboboxEmpty>
                                                            <ComboboxList className="custom-scroll">
                                                                {(item) => (
                                                                    <ComboboxItem
                                                                        key={item}
                                                                        value={item}
                                                                    >
                                                                        {tzType ===
                                                                        'timezoneName'
                                                                            ? TIME_ZONES[
                                                                                  item as TimeZone
                                                                              ].tzName
                                                                            : item}
                                                                    </ComboboxItem>
                                                                )}
                                                            </ComboboxList>
                                                        </ComboboxContent>
                                                    </Combobox>
                                                    <FormDescription>
                                                        Select timezone by IANA identifier,
                                                        abbreviation, or UTC offset.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="label"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Label (e.g., "New York Office")
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="flex gap-2 flex-wrap  items-center justify-between">
                                                        <Input
                                                            className="flex-1 min-w-fit"
                                                            placeholder="Enter location name..."
                                                            {...field}
                                                            value={field.value ?? ''}
                                                        />
                                                        <Button
                                                            className="min-w-fit"
                                                            size="lg"
                                                            type="submit"
                                                        >
                                                            <ClockPlus className="size-4" />
                                                            Add Timezone
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    A friendly name for this timezone location.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </form>
                            </Form>

                            <PoweredBy
                                className="mt-6"
                                description="This tool uses Chronos.timeZone() for timezone conversions."
                                url="https://toolbox.nazmul-nhb.dev/docs/classes/Chronos/conversion#timezone"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Timezone Cards Grid */}
                {isValidArray(store.value) ? (
                    <Card className="h-fit max-w-full max-h-[calc(100vh-5rem)] overflow-y-auto custom-scroll">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GlobeLock className="size-4" /> Added Timezones
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                {store.value.map((entry) => {
                                    const chronos = time.timeZone(entry.timezone);

                                    return (
                                        <TimeZoneCard
                                            chronos={chronos}
                                            entry={entry}
                                            key={entry.id}
                                            onRemove={handleRemoveEntry}
                                        />
                                    );
                                })}
                            </div>
                            <PoweredBy
                                className="mt-6"
                                description="This time updates in real-time using the useClock hook."
                                name="nhb-hooks"
                                url="https://github.com/nazmul-nhb/nhb-hooks/blob/main/README.md#useclock"
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <EmptyData
                        description="No timezones added yet. Add one to start comparing times."
                        Icon={Globe}
                        title="No TImezone Added"
                    />
                )}
            </div>
        </div>
    );
}

interface TimeZoneCardProps {
    entry: TimeZoneEntry;
    chronos: Chronos;
    onRemove: (id: string) => void;
}

function TimeZoneCard({ entry, chronos, onRemove }: TimeZoneCardProps) {
    return (
        <Card className="relative flex-1 min-w-fit" size="sm">
            <CardContent>
                <div className="flex items-start flex-wrap justify-between gap-4">
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
                                {chronos.format('HH:mm:ss')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {chronos.format('ddd, mmmm DD, YYYY')}
                            </div>
                            <div className="text-xs font-medium text-muted-foreground">
                                {chronos.utcOffset}
                            </div>
                        </div>
                    </div>

                    <Button
                        className="text-destructive hover:text-destructive"
                        onClick={() => onRemove(entry.id)}
                        size="icon-sm"
                        variant="ghost"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
