'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useBreakPoint, useClock, useMount } from 'nhb-hooks';
import { Chronos } from 'nhb-toolbox';
import { toTrainCase } from 'nhb-toolbox/change-case';
import type { DayPart } from 'nhb-toolbox/date/types';
import type { $Record } from 'nhb-toolbox/object/types';
import { useCallback, useMemo, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/** Bangla weekday header abbreviations — Sun→Sat order (matches JS getDay()) */
const BANGLA_WEEKDAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'] as const;

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

/** Advance a Chronos-based month by delta months, returns a Date */
function shiftMonth(d: Date, delta: number): Date {
    return new Chronos(d).addMonths(delta).toDate();
}

/**
 * Builds the day cells for a Bangla month calendar view.
 *
 * Strategy: find the Gregorian date that corresponds to Bangla day 1 of the
 * Bangla month that contains Gregorian day 14 of the given Gregorian month
 * (day 14 is always inside the correct Bangla month for any Gregorian month).
 * Then walk forward one day at a time collecting Bangla date strings until the
 * Bangla month changes, which gives us all days of that Bangla month.
 */
function buildBanglaMonth(gregYear: number, gregMonth: number) {
    // Anchor on day 16 — guaranteed to be in the correct Bangla month
    const anchor = new Chronos(gregYear, gregMonth, 16);

    // const anchor = target.toBangla();
    const anchorEn = anchor.toBangla({ locale: 'en' });
    const targetMonthNum = anchorEn.month;

    // Scan backward from day 14 to find Bangla day 1
    let cursor = anchor;
    while (true) {
        const bd = cursor.toBangla({ locale: 'en' });
        if (bd.month !== targetMonthNum) {
            // cursor went back too far — step forward one day to get back to bangla day 1
            cursor = cursor.addDays(1);
            break;
        }
        if (bd.date === 1) break;
        cursor = cursor.addDays(-1);
    }

    const bangla1 = cursor; // Gregorian date of Bangla day 1
    const startDow = bangla1.weekDay; // 0 = Sun

    // Now walk forward collecting all days of this Bangla month
    const days: { bDay: string; isToday: boolean }[] = [];
    let walker = bangla1;
    while (true) {
        const bdEn = walker.toBangla({ locale: 'en' });
        if (bdEn.month !== targetMonthNum) break;
        const bdBn = walker.toBangla(); // Bangla locale for display digits
        days.push({ bDay: bdBn.date, isToday: walker.isToday() });
        walker = walker.addDays(1);
    }

    return {
        monthYear: anchor.formatBangla('mmmm yyyy'),
        startDow,
        days,
    };
}

const DAY_PARTS: $Record<DayPart, string> = {
    morning: 'সকাল',
    afternoon: 'বিকেল',
    evening: 'সন্ধ্যা',
    night: 'রাত',
    lateNight: 'গভীর রাত',
    midnight: 'মধ্যরাত',
};

// ------------------------------------------------------------------
// BanglaMonthView
// ------------------------------------------------------------------

interface BanglaMonthViewProps {
    gregYear: number;
    gregMonth: number;
}

function BanglaMonthView({ gregYear, gregMonth }: BanglaMonthViewProps) {
    const { monthYear, startDow, days } = useMemo(() => {
        return buildBanglaMonth(gregYear, gregMonth);
    }, [gregYear, gregMonth]);

    return (
        <div className="w-full min-w-52 flex-1 shrink-0 text-sm font-tiro">
            {/* Bangla month + year heading */}
            <div className="text-center text-lg mb-2 px-2 font-anek">{monthYear}</div>

            {/* Weekday header row */}
            <div className="grid grid-cols-7 gap-px mb-1">
                {BANGLA_WEEKDAYS.map((w) => (
                    <div
                        className="text-muted-foreground text-center h-7 flex items-center justify-center font-medium"
                        key={w}
                    >
                        {w}
                    </div>
                ))}
            </div>

            {/* Day grid — leading empty cells then Bangla day numbers */}
            <div className="grid grid-cols-7 gap-px">
                {Array.from({ length: startDow }, (_, i) => (
                    <div className="w-7" key={`e${i}`} />
                ))}
                {days.map(({ bDay, isToday }, i) => (
                    <div
                        className={cn(
                            'size-7.5 flex items-center justify-center rounded-md select-none',
                            isToday
                                ? 'bg-accent-foreground text-accent font-bold'
                                : 'hover:bg-muted'
                        )}
                        key={bDay.concat(`${i}`)}
                    >
                        {bDay}
                    </div>
                ))}
            </div>
        </div>
    );
}

function season(str: string) {
    const match = str.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
}

// ------------------------------------------------------------------
// DateTimeCalendar (main component)
// ------------------------------------------------------------------

export default function DateTimeCalendar() {
    const [open, setOpen] = useState(false);
    const [isBnCal, setIsBnCal] = useState(false);
    const [isBnTime, setIsBnTime] = useState(!isBnCal);
    const [month, setMonth] = useState<Date>(new Date());

    const { mobile } = useBreakPoint();

    const { time, formatted } = useClock({ interval: 'frame', format: 'HH:mm' });

    const clockTime = useMemo(() => {
        return isBnTime
            ? time.formatBangla(
                  `dd, DD mmmm (S), YYYY hh:mm:ss [(${DAY_PARTS[time.getPartOfDay()]})]`
              )
            : time.format(
                  `dd, DD mmm [(${season(time.season({ preset: 'bangladesh' }))})], YYYY hh:mm:ss [(${toTrainCase(time.getPartOfDay())})]`
              );
    }, [time, isBnTime]);

    const nextMonth = useMemo(() => shiftMonth(month, 1), [month]);

    const handlePrev = useCallback(() => setMonth((m) => shiftMonth(m, -1)), []);
    const handleNext = useCallback(() => setMonth((m) => shiftMonth(m, 1)), []);

    return useMount(
        <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger asChild>
                <button
                    aria-label="Open calendar"
                    className={cn(
                        'fixed z-50 right-6 bottom-19 font-source-sans',
                        'size-12 rounded-full shadow-xl',
                        'bg-primary text-primary-foreground',
                        'flex flex-col items-center justify-center gap-0.5',
                        'transition-all duration-200 hover:scale-105',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                    )}
                    type="button"
                >
                    <span className="text-sm leading-none font-bold tabular-nums">
                        {formatted}
                    </span>
                    <span className="text-xs leading-none opacity-75 tabular-nums">
                        {time.format('mmm DD')}
                    </span>
                </button>
            </PopoverTrigger>

            {/* ── Popover ── */}
            <PopoverContent
                align={mobile ? 'start' : 'end'}
                className="w-auto p-0 min-w-84 overflow-hidden"
                side="top"
                sideOffset={10}
            >
                {/* Header: prev / month labels + calendar switcher / next */}
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b">
                    <button
                        aria-label="Previous month"
                        className="size-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
                        onClick={handlePrev}
                        type="button"
                    >
                        <ChevronLeft className="size-4" />
                    </button>

                    <div className="flex flex-col items-center gap-1.5">
                        {/* Gregorian / বাংলা pill toggle */}
                        <div className="flex rounded-md overflow-hidden border text-sm">
                            <button
                                className={cn(
                                    'px-3 py-1 transition-colors font-source-sans',
                                    !isBnCal
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted'
                                )}
                                onClick={() => {
                                    setIsBnCal(false);
                                    setIsBnTime(true);
                                }}
                                type="button"
                            >
                                Gregorian
                            </button>
                            <button
                                className={cn(
                                    'px-3 py-1 transition-colors border-l font-anek',
                                    isBnCal
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted'
                                )}
                                onClick={() => {
                                    setIsBnCal(true);
                                    setIsBnTime(false);
                                }}
                                type="button"
                            >
                                বাংলা
                            </button>
                        </div>
                    </div>

                    <button
                        aria-label="Next month"
                        className="size-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
                        onClick={handleNext}
                        type="button"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                </div>

                {/* Calendar body */}
                <div className="p-3">
                    {isBnCal ? (
                        <Fragment>
                            <div className="flex gap-4 md:flex-row flex-col">
                                <BanglaMonthView
                                    gregMonth={month.getMonth()}
                                    gregYear={month.getFullYear()}
                                />
                                {/* <div className="w-px bg-border self-stretch" /> */}
                                <BanglaMonthView
                                    gregMonth={nextMonth.getMonth()}
                                    gregYear={nextMonth.getFullYear()}
                                />
                            </div>

                            <div
                                className={cn(
                                    'border-t mt-2 text-sm text-muted-foreground text-center select-none pb-1 pt-3',
                                    isBnTime ? 'font-tiro' : 'font-source-sans'
                                )}
                                onClick={() => setIsBnTime((t) => !t)}
                            >
                                {clockTime}
                            </div>
                        </Fragment>
                    ) : (
                        <Calendar
                            className="w-full p-0"
                            classNames={{
                                months: 'w-full flex flex-col sm:flex-row gap-4',
                                month: 'w-full flex flex-col gap-4 font-source-sans',
                                weekdays: 'flex w-full justify-between',
                                week: 'flex w-full mt-2 justify-between',
                            }}
                            footer={
                                <div
                                    className={cn(
                                        'border-t mt-2 text-sm text-muted-foreground text-center select-none pb-1 pt-3',
                                        isBnTime ? 'font-tiro' : 'font-source-sans'
                                    )}
                                    onClick={() => setIsBnTime((t) => !t)}
                                >
                                    {clockTime}
                                </div>
                            }
                            hideNavigation
                            month={month}
                            numberOfMonths={1}
                            onMonthChange={setMonth}
                        />
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
