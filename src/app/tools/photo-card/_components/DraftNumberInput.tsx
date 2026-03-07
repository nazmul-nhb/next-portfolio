'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

type Props = {
    ariaLabel: string;
    id?: string;
    max?: number;
    min?: number;
    value: number;
    onCommit: (value: number) => void;
};

function clamp(value: number, min?: number, max?: number) {
    if (min != null && value < min) return min;
    if (max != null && value > max) return max;

    return value;
}

export default function DraftNumberInput({ ariaLabel, id, max, min, onCommit, value }: Props) {
    const [draft, setDraft] = useState(String(value));

    useEffect(() => {
        setDraft(String(value));
    }, [value]);

    const commit = () => {
        const parsed = Number(draft);

        if (!Number.isFinite(parsed)) {
            setDraft(String(value));
            return;
        }

        const normalized = clamp(Math.round(parsed), min, max);

        setDraft(String(normalized));
        onCommit(normalized);
    };

    return (
        <Input
            aria-label={ariaLabel}
            // className="max-w-20"
            id={id}
            inputMode="numeric"
            onBlur={commit}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    event.currentTarget.blur();
                }
            }}
            spellCheck={false}
            type="text"
            value={draft}
        />
    );
}
