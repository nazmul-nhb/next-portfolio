'use client';

import { ArrowDown, ArrowUp, Type, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    FONT_OPTIONS,
    PHOTO_CARD_SECTION_LABELS,
    PHOTO_CARD_SECTION_OPTIONS,
} from '@/lib/constants';
import type { PhotoCardSectionId, TextLayer } from '@/lib/photo-card/types';
import { getPhotoCardFontOption } from '@/lib/photo-card/utils';
import { cn } from '@/lib/utils';
import type { FontId } from '@/types';
import ColorInputField from './ColorInputField';
import DraftNumberInput from './DraftNumberInput';

type Props = {
    index: number;
    isActive: boolean;
    canMoveUp: boolean;
    canMoveDown: boolean;
    layer: TextLayer;
    onSelect: () => void;
    onChange: (patch: Partial<TextLayer>) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
};

export default function TextLayerEditor({
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
    const activeFont = getPhotoCardFontOption(layer.fontFamily);

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
                            Text {index + 1}
                        </Badge>
                        <span
                            className="text-sm font-medium"
                            style={{ fontFamily: activeFont.fontFamily }}
                        >
                            {layer.text.trim() || 'Empty text layer'}
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

            <div className="space-y-2">
                <Label htmlFor={`text-layer-text-${layer.id}`}>Text</Label>
                <Textarea
                    aria-label="Text layer content"
                    className="min-h-24 max-h-48 overflow-y-auto custom-scroll"
                    id={`text-layer-text-${layer.id}`}
                    onChange={(event) => onChange({ text: event.target.value })}
                    placeholder="Add your headline, caption, or call to action."
                    value={layer.text}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={`text-layer-section-${layer.id}`}>Section</Label>
                    <Select
                        onValueChange={(value) =>
                            onChange({ section: value as PhotoCardSectionId })
                        }
                        value={layer.section}
                    >
                        <SelectTrigger
                            aria-label="Text section"
                            id={`text-layer-section-${layer.id}`}
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

                <div className="space-y-2">
                    <Label htmlFor={`text-layer-font-${layer.id}`}>Font</Label>
                    <Select
                        onValueChange={(value) => onChange({ fontFamily: value as FontId })}
                        value={layer.fontFamily}
                    >
                        <SelectTrigger
                            aria-label="Font family"
                            id={`text-layer-font-${layer.id}`}
                        >
                            <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                        <SelectContent>
                            {FONT_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <span style={{ fontFamily: option.fontFamily }}>
                                        {option.label}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor={`text-layer-size-${layer.id}`}>Font Size</Label>
                    <DraftNumberInput
                        ariaLabel="Text font size"
                        id={`text-layer-size-${layer.id}`}
                        max={400}
                        min={8}
                        onCommit={(value) => onChange({ fontSize: value })}
                        value={layer.fontSize}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`text-layer-x-${layer.id}`}>X Position</Label>
                    <DraftNumberInput
                        ariaLabel="Text x position"
                        id={`text-layer-x-${layer.id}`}
                        min={0}
                        onCommit={(value) => onChange({ x: value })}
                        value={layer.x}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`text-layer-y-${layer.id}`}>Y Position</Label>
                    <DraftNumberInput
                        ariaLabel="Text y position"
                        id={`text-layer-y-${layer.id}`}
                        min={0}
                        onCommit={(value) => onChange({ y: value })}
                        value={layer.y}
                    />
                </div>
            </div>

            <div className="space-y-0.5">
                <div className="text-sm font-medium">Color</div>
                <ColorInputField
                    ariaLabel="Text color"
                    onChange={(value) => onChange({ color: value })}
                    value={layer.color}
                />
            </div>

            <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                    <Type className="size-4" />
                    Live style preview
                </div>
                <p
                    className="mt-2 wrap-break-word"
                    style={{
                        color: layer.color,
                        fontFamily: activeFont.fontFamily,
                        fontSize: `${Math.min(layer.fontSize, 28)}px`,
                    }}
                >
                    {layer.text.trim() || 'Your text will appear here.'}
                </p>
            </div>
        </div>
    );
}
