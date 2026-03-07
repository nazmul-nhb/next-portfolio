'use client';

import { ArrowDown, ArrowUp, ImageIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ImageLayer } from '@/lib/photo-card/types';

type Props = {
    index: number;
    isActive: boolean;
    canMoveUp: boolean;
    canMoveDown: boolean;
    layer: ImageLayer;
    onSelect: () => void;
    onChange: (patch: Partial<ImageLayer>) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
};

export default function ImageLayerEditor({
    index,
    isActive,
    canMoveDown,
    canMoveUp,
    layer,
    onChange,
    onMoveDown,
    onMoveUp,
    onRemove,
    onSelect,
}: Props) {
    const scale =
        layer.naturalWidth && layer.naturalHeight
            ? Math.round((layer.width / layer.naturalWidth) * 100)
            : 100;

    return (
        <div
            className={cn(
                'space-y-4 rounded-xl border p-4 transition-colors',
                isActive ? 'border-primary bg-primary/5' : 'border-border'
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <button className="min-w-0 text-left" onClick={onSelect} type="button">
                    <div className="flex items-center gap-2">
                        <Badge variant={isActive ? 'default' : 'outline'}>
                            Image {index + 1}
                        </Badge>
                        <span className="truncate text-sm font-medium">
                            {layer.width} × {layer.height}px
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Positioned at ({layer.x}, {layer.y})
                    </p>
                </button>

                <div className="flex items-center gap-1">
                    <Button
                        disabled={!canMoveUp}
                        onClick={onMoveUp}
                        size="icon"
                        type="button"
                        variant="ghost"
                    >
                        <ArrowUp />
                    </Button>
                    <Button
                        disabled={!canMoveDown}
                        onClick={onMoveDown}
                        size="icon"
                        type="button"
                        variant="ghost"
                    >
                        <ArrowDown />
                    </Button>
                    <Button onClick={onRemove} size="icon" type="button" variant="ghost">
                        <X />
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border bg-muted/30">
                <img
                    alt={`Layer ${index + 1}`}
                    className="h-32 w-full object-contain"
                    src={layer.src}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor={`image-scale-${layer.id}`}>
                        Scale (%)
                    </label>
                    <Input
                        aria-label="Image scale percentage"
                        id={`image-scale-${layer.id}`}
                        min={1}
                        onChange={(event) => {
                            const nextScale = Number(event.target.value) || scale;

                            if (!layer.naturalWidth || !layer.naturalHeight) return;

                            onChange({
                                width: Math.max(
                                    1,
                                    Math.round((layer.naturalWidth * nextScale) / 100)
                                ),
                                height: Math.max(
                                    1,
                                    Math.round((layer.naturalHeight * nextScale) / 100)
                                ),
                            });
                        }}
                        type="number"
                        value={scale}
                    />
                </div>

                <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                        <ImageIcon className="size-4" />
                        Original
                    </div>
                    <p className="mt-2">
                        {layer.naturalWidth ?? layer.width} ×{' '}
                        {layer.naturalHeight ?? layer.height}px
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor={`image-x-${layer.id}`}>
                        X Position
                    </label>
                    <Input
                        aria-label="Image x position"
                        id={`image-x-${layer.id}`}
                        onChange={(event) => onChange({ x: Number(event.target.value) || 0 })}
                        type="number"
                        value={layer.x}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor={`image-y-${layer.id}`}>
                        Y Position
                    </label>
                    <Input
                        aria-label="Image y position"
                        id={`image-y-${layer.id}`}
                        onChange={(event) => onChange({ y: Number(event.target.value) || 0 })}
                        type="number"
                        value={layer.y}
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor={`image-width-${layer.id}`}>
                        Width
                    </label>
                    <Input
                        aria-label="Image width"
                        id={`image-width-${layer.id}`}
                        min={1}
                        onChange={(event) =>
                            onChange({ width: Number(event.target.value) || layer.width })
                        }
                        type="number"
                        value={layer.width}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor={`image-height-${layer.id}`}>
                        Height
                    </label>
                    <Input
                        aria-label="Image height"
                        id={`image-height-${layer.id}`}
                        min={1}
                        onChange={(event) =>
                            onChange({ height: Number(event.target.value) || layer.height })
                        }
                        type="number"
                        value={layer.height}
                    />
                </div>
            </div>
        </div>
    );
}
