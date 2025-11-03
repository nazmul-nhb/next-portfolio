"use client";

import { Button } from "@/components/ui/button";
import { useClock, useTimer } from "nhb-hooks";
import { Chronos } from "nhb-toolbox";
import { pluralizer } from "nhb-toolbox/pluralizer";
import { useEffect, useState } from "react";

export default function ClockTimer() {
    const [mounted, setMounted] = useState(false);
    const { formatted, pause, isPaused, resume } = useClock({
        interval: "frame",
        format: "dd, mmm DD, yyyy - hh:mm:ss a",
    });

    const { days, hours, minutes, seconds } = useTimer(
        new Chronos().endOf("day"),
    );

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <span className="flex flex-col gap-4 font-semibold">
            <span>
                Today is{" "}
                <span className="text-green-700 animate-bounce">
                    {formatted}
                </span>
            </span>
            <span>
                Deadline Ends in{" "}
                <span className="text-red-600 animate-pulse">
                    {pluralizer.pluralize("day", {
                        count: days,
                        inclusive: true,
                    })}
                    ,{" "}
                    {pluralizer.pluralize("hour", {
                        count: hours,
                        inclusive: true,
                    })}
                    ,{" "}
                    {pluralizer.pluralize("minute", {
                        count: minutes,
                        inclusive: true,
                    })}
                    ,{" "}
                    {pluralizer.pluralize("second", {
                        count: seconds,
                        inclusive: true,
                    })}
                </span>
            </span>
            <Button
                variant="destructive"
                className=""
                onClick={isPaused ? resume : pause}
            >
                {isPaused ? "Resume " : "Pause "} Clock
            </Button>
        </span>
    );
}
