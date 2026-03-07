'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Props = {
    id?: string;
    label?: string;
    ariaLabel: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
};

/**
 * Color input field component that combines color and hex input
 * Uses shadcn/ui components for consistent styling
 */
export default function ColorInputField({
    id,
    label,
    ariaLabel,
    value,
    onChange,
    className,
}: Props) {
    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <Label className="text-sm font-medium" htmlFor={id}>
                    {label}
                </Label>
            )}
            <div className="flex items-center gap-2">
                <div className="h-10 w-14 overflow-hidden rounded-lg border bg-background">
                    <input
                        aria-label={ariaLabel}
                        className="h-full w-full cursor-pointer border-0"
                        onChange={(e) => onChange(e.target.value)}
                        type="color"
                        value={value}
                    />
                </div>
                <Input
                    aria-label={`${ariaLabel} hex`}
                    className="font-mono"
                    id={id}
                    inputMode="text"
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    spellCheck={false}
                    type="text"
                    value={value}
                />
            </div>
        </div>
    );
}
