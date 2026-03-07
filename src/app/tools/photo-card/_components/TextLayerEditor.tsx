'use client';

import { ArrowDown, ArrowUp, Type, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
    PHOTO_CARD_FONT_OPTIONS,
    getPhotoCardFontOption,
    type PhotoCardFontId,
    type TextLayer,
} from '@/lib/photo-card/types';

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
                        {activeFont.label}, {layer.fontSize}px at ({layer.x}, {layer.y})
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
                <label className="text-sm font-medium" htmlFor={`text-layer-text-${layer.id}`}>
                    Text
                </label>
                <Textarea
                    aria-label="Text layer content"
                    className="min-h-24 resize-y"
                    id={`text-layer-text-${layer.id}`}
                    onChange={(event) => onChange({ text: event.target.value })}
                    placeholder="Add your headline, caption, or call to action."
                    value={layer.text}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <div className="text-sm font-medium">Font</div>
                    <Select
                        onValueChange={(value) =>
                            onChange({ fontFamily: value as PhotoCardFontId })
                        }
                        value={layer.fontFamily}
                    >
                        <SelectTrigger aria-label="Font family">
                            <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                        <SelectContent>
                            {PHOTO_CARD_FONT_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <span style={{ fontFamily: option.fontFamily }}>
                                        {option.label}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label
                        className="text-sm font-medium"
                        htmlFor={`text-layer-size-${layer.id}`}
                    >
                        Font Size
                    </label>
                    <Input
                        aria-label="Text font size"
                        id={`text-layer-size-${layer.id}`}
                        min={8}
                        onChange={(event) =>
                            onChange({ fontSize: Number(event.target.value) || layer.fontSize })
                        }
                        type="number"
                        value={layer.fontSize}
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                    <div className="text-sm font-medium">Color</div>
                    <div className="flex items-center gap-2">
                        <Input
                            aria-label="Text color swatch"
                            className="h-10 w-14 p-1"
                            onChange={(event) => onChange({ color: event.target.value })}
                            type="color"
                            value={layer.color}
                        />
                        <Input
                            aria-label="Text color hex value"
                            onChange={(event) => onChange({ color: event.target.value })}
                            spellCheck={false}
                            value={layer.color}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor={`text-layer-x-${layer.id}`}>
                        X Position
                    </label>
                    <Input
                        aria-label="Text x position"
                        id={`text-layer-x-${layer.id}`}
                        onChange={(event) => onChange({ x: Number(event.target.value) || 0 })}
                        type="number"
                        value={layer.x}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor={`text-layer-y-${layer.id}`}>
                        Y Position
                    </label>
                    <Input
                        aria-label="Text y position"
                        id={`text-layer-y-${layer.id}`}
                        onChange={(event) => onChange({ y: Number(event.target.value) || 0 })}
                        type="number"
                        value={layer.y}
                    />
                </div>
            </div>

            <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                    <Type className="size-4" />
                    Live style preview
                </div>
                <p
                    className="mt-2 break-words"
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
