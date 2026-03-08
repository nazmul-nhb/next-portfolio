'use client';

import { ArrowDown, ArrowUp, ImageIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    PHOTO_CARD_SECTION_LABELS,
    PHOTO_CARD_SECTION_OPTIONS,
} from '@/lib/photo-card/constants';
import type { ImageLayer, PhotoCardSectionId } from '@/lib/photo-card/types';
import { cn } from '@/lib/utils';
import DraftNumberInput from './DraftNumberInput';

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
                        {PHOTO_CARD_SECTION_LABELS[layer.section]} section
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
                {/* biome-ignore lint/performance/noImgElement: editor layer preview */}
                <img
                    alt={`Layer ${index + 1}`}
                    className="h-32 w-full object-contain"
                    src={layer.src}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={`image-section-${layer.id}`}>Section</Label>
                    <Select
                        onValueChange={(value) =>
                            onChange({ section: value as PhotoCardSectionId })
                        }
                        value={layer.section}
                    >
                        <SelectTrigger
                            aria-label="Image section"
                            id={`image-section-${layer.id}`}
                        >
                            <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                        <SelectContent>
                            {PHOTO_CARD_SECTION_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor={`image-scale-${layer.id}`}>Scale (%)</Label>
                    <DraftNumberInput
                        ariaLabel="Image scale percentage"
                        id={`image-scale-${layer.id}`}
                        min={1}
                        onCommit={(nextScale) => {
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
                        value={scale}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`image-width-${layer.id}`}>Width</Label>
                    <DraftNumberInput
                        ariaLabel="Image width"
                        id={`image-width-${layer.id}`}
                        min={1}
                        onCommit={(value) => onChange({ width: value })}
                        value={layer.width}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`image-height-${layer.id}`}>Height</Label>
                    <DraftNumberInput
                        ariaLabel="Image height"
                        id={`image-height-${layer.id}`}
                        min={1}
                        onCommit={(value) => onChange({ height: value })}
                        value={layer.height}
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    checked={layer.maintainAspectRatio !== false}
                    id={`image-aspect-ratio-${layer.id}`}
                    onCheckedChange={(checked) =>
                        onChange({ maintainAspectRatio: Boolean(checked) })
                    }
                />
                <Label
                    className="text-sm font-medium cursor-pointer"
                    htmlFor={`image-aspect-ratio-${layer.id}`}
                >
                    Maintain aspect ratio while resizing
                </Label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={`image-x-${layer.id}`}>X Position</Label>
                    <DraftNumberInput
                        ariaLabel="Image x position"
                        id={`image-x-${layer.id}`}
                        min={0}
                        onCommit={(value) => onChange({ x: value })}
                        value={layer.x}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`image-y-${layer.id}`}>Y Position</Label>
                    <DraftNumberInput
                        ariaLabel="Image y position"
                        id={`image-y-${layer.id}`}
                        min={0}
                        onCommit={(value) => onChange({ y: value })}
                        value={layer.y}
                    />
                </div>
            </div>
        </div>
    );
}
