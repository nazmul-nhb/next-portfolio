'use client';

import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { httpRequest } from '@/lib/actions/baseRequest';
import { cn } from '@/lib/utils';

interface Option {
    id: number;
    title: string;
    slug: string;
}

interface TagCategorySelectorProps {
    /** Label for the selector */
    label: string;
    /** API endpoint to fetch options (e.g., '/api/tags') */
    endpoint: `/${string}`;
    /** Currently selected IDs */
    selectedIds: number[];
    /** Callback when selection changes */
    onChange: (ids: number[]) => void;
    /** Whether to allow creating new items inline */
    allowCreate?: boolean;
    /** Placeholder text for the search input */
    placeholder?: string;
}

/**
 * A multi-select combobox for picking tags or categories.
 * Supports search filtering, inline creation, and removing selections.
 */
export function TagCategorySelector({
    label,
    endpoint,
    selectedIds,
    onChange,
    allowCreate = false,
    placeholder = 'Search...',
}: TagCategorySelectorProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<Option[]>([]);
    const [search, setSearch] = useState('');
    const [creating, setCreating] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    /** Fetch available options from the API */
    const fetchOptions = useCallback(async () => {
        try {
            const { data } = await httpRequest<Option[]>(endpoint, { method: 'GET' });
            if (data) setOptions(data);
        } catch {
            // Silently fail — user can retry by reopening
        }
    }, [endpoint]);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    /** Focus the search input when the popover opens */
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [open]);

    const filtered = options.filter((opt) =>
        opt.title.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id));

    const toggleOption = (id: number) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((sid) => sid !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const removeOption = (id: number) => {
        onChange(selectedIds.filter((sid) => sid !== id));
    };

    /** Create a new tag/category inline */
    const handleCreate = async () => {
        const title = search.trim();
        if (!title) return;

        setCreating(true);
        try {
            const { data } = await httpRequest<Option, { title: string }>(endpoint, {
                method: 'POST',
                body: { title },
            });
            if (data) {
                setOptions((prev) => [...prev, data]);
                onChange([...selectedIds, data.id]);
                setSearch('');
                toast.success(`${label.slice(0, -1)} "${title}" created!`);
            }
        } catch {
            toast.error(`Failed to create ${label.toLowerCase().slice(0, -1)}.`);
        } finally {
            setCreating(false);
        }
    };

    const noResults = filtered.length === 0 && search.trim().length > 0;

    return (
        <div className="space-y-2">
            <Popover onOpenChange={setOpen} open={open}>
                <PopoverTrigger asChild>
                    <Button
                        className="w-full justify-between font-normal"
                        role="combobox"
                        type="button"
                        variant="outline"
                    >
                        <span className="truncate text-muted-foreground">
                            {selectedIds.length > 0
                                ? `${selectedIds.length} ${label.toLowerCase()} selected`
                                : `Select ${label.toLowerCase()}...`}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-2">
                    <Input
                        className="mb-2"
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={placeholder}
                        ref={inputRef}
                        value={search}
                    />

                    <div className="max-h-48 overflow-y-auto">
                        {filtered.map((opt) => (
                            <button
                                className={cn(
                                    'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent',
                                    selectedIds.includes(opt.id) && 'bg-accent/50'
                                )}
                                key={opt.id}
                                onClick={() => toggleOption(opt.id)}
                                type="button"
                            >
                                <Check
                                    className={cn(
                                        'h-3.5 w-3.5 shrink-0',
                                        selectedIds.includes(opt.id)
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                    )}
                                />
                                {opt.title}
                            </button>
                        ))}

                        {noResults && !allowCreate && (
                            <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                                No {label.toLowerCase()} found.
                            </p>
                        )}

                        {noResults && allowCreate && (
                            <button
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary hover:bg-accent disabled:opacity-50"
                                disabled={creating}
                                onClick={handleCreate}
                                type="button"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                {creating ? 'Creating...' : `Create "${search.trim()}"`}
                            </button>
                        )}

                        {options.length === 0 && !search && (
                            <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                                No {label.toLowerCase()} yet.
                                {allowCreate && ' Type to create one.'}
                            </p>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            {/* Selected pills */}
            {selectedOptions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selectedOptions.map((opt) => (
                        <span
                            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                            key={opt.id}
                        >
                            {opt.title}
                            <button
                                className="rounded-full p-0.5 hover:bg-primary/20"
                                onClick={() => removeOption(opt.id)}
                                type="button"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
