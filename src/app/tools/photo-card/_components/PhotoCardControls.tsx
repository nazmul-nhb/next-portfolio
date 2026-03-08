'use client';

import {
    Database,
    Download,
    ImagePlus,
    Layers3,
    LayoutTemplate,
    Loader2,
    Save,
    Trash2,
    Type,
    Upload,
} from 'lucide-react';
import EmptyData from '@/components/misc/empty-data';
import SmartAlert from '@/components/misc/smart-alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PHOTO_CARD_SECTION_OPTIONS } from '@/lib/photo-card/constants';
import type { SavedPhotoCard } from '@/lib/photo-card/indexed-db';
import type {
    ImageLayer,
    PhotoCardConfig,
    PhotoCardSectionConfig,
    PhotoCardSectionId,
    TextLayer,
} from '@/lib/photo-card/types';
import ColorInputField from './ColorInputField';
import DraftNumberInput from './DraftNumberInput';
import ImageLayerEditor from './ImageLayerEditor';
import TextLayerEditor from './TextLayerEditor';

type Props = {
    activeImageId: string | null;
    activeTextId: string | null;
    config: PhotoCardConfig;
    newLayerSection: PhotoCardSectionId;
    previewUrls: Record<string, string>;
    savedCards: SavedPhotoCard[];
    savedCardsLoading: boolean;
    savePending: boolean;
    validationIssues: string[];
    onAddTextLayer: () => void;
    onCanvasChange: (
        patch: Partial<Pick<PhotoCardConfig, 'backgroundColor' | 'height' | 'width'>>
    ) => void;
    onDeleteSaved: (id: SavedPhotoCard['id']) => void;
    onDownloadSaved: (card: SavedPhotoCard, type: 'image/png' | 'image/jpeg') => void;
    onExport: (type: 'image/png' | 'image/jpeg') => void;
    onImageChange: (id: string, patch: Partial<ImageLayer>) => void;
    onImageMove: (id: string, direction: 'up' | 'down') => void;
    onImageRemove: (id: string) => void;
    onLoadSaved: (card: SavedPhotoCard) => void;
    onNewLayerSectionChange: (section: PhotoCardSectionId) => void;
    onSaveToIndexedDb: () => void;
    onSectionChange: (
        section: 'header' | 'footer',
        patch: Partial<PhotoCardSectionConfig>
    ) => void;
    onSelectImage: (id: string) => void;
    onSelectText: (id: string) => void;
    onTextChange: (id: string, patch: Partial<TextLayer>) => void;
    onTextMove: (id: string, direction: 'up' | 'down') => void;
    onTextRemove: (id: string) => void;
    onUploadImages: (files: FileList | null) => void;
};

export default function PhotoCardControls({
    activeImageId,
    activeTextId,
    config,
    newLayerSection,
    previewUrls,
    savedCards,
    savedCardsLoading,
    savePending,
    validationIssues,
    onAddTextLayer,
    onCanvasChange,
    onDeleteSaved,
    onDownloadSaved,
    onExport,
    onImageChange,
    onImageMove,
    onImageRemove,
    onLoadSaved,
    onNewLayerSectionChange,
    onSaveToIndexedDb,
    onSectionChange,
    onSelectImage,
    onSelectText,
    onTextChange,
    onTextMove,
    onTextRemove,
    onUploadImages,
}: Props) {
    return (
        <div className="space-y-6 max-w-full mx-auto">
            {validationIssues.length > 0 && (
                <SmartAlert
                    description={
                        <ul className="ml-5 list-disc space-y-1">
                            {validationIssues.map((issue) => (
                                <li key={issue}>{issue}</li>
                            ))}
                        </ul>
                    }
                    title="Review these values before exporting"
                    variant="destructive"
                />
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Canvas Settings</CardTitle>
                    <CardDescription>
                        Draft values stay editable until blur or Enter, so the inputs stop
                        jumping while you type.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="photo-card-width">Width</Label>
                        <DraftNumberInput
                            ariaLabel="Canvas width"
                            id="photo-card-width"
                            max={4000}
                            min={120}
                            onCommit={(value) => onCanvasChange({ width: value })}
                            value={config.width}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="photo-card-height">Height</Label>
                        <DraftNumberInput
                            ariaLabel="Canvas height"
                            id="photo-card-height"
                            max={4000}
                            min={120}
                            onCommit={(value) => onCanvasChange({ height: value })}
                            value={config.height}
                        />
                    </div>
                    <div className="space-y-0.5">
                        <div className="text-sm font-medium">Background</div>
                        <ColorInputField
                            ariaLabel="Canvas background color"
                            onChange={(value) => onCanvasChange({ backgroundColor: value })}
                            value={config.backgroundColor}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LayoutTemplate className="size-5" />
                        Header & Footer
                    </CardTitle>
                    <CardDescription>
                        Turn sections on when you want dedicated branded strips with their own
                        colors, images, and text layers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-2">
                    {(['header', 'footer'] as const).map((sectionKey) => {
                        const section = config.sections[sectionKey];

                        return (
                            <div className="space-y-4 rounded-xl border p-4" key={sectionKey}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium capitalize">{sectionKey}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Add images and text directly inside the {sectionKey}
                                            .
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={section.enabled}
                                            id={sectionKey}
                                            name={sectionKey}
                                            onCheckedChange={(checked) =>
                                                onSectionChange(sectionKey, {
                                                    enabled: checked === true,
                                                })
                                            }
                                        />
                                        <label
                                            className="text-sm mt-1 select-none cursor-pointer"
                                            htmlFor={sectionKey}
                                        >
                                            Enabled
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 justify-between">
                                    <div className="space-y-2 md:flex-1 shrink-0">
                                        <Label htmlFor={`${sectionKey}-height`}>Height</Label>
                                        <DraftNumberInput
                                            ariaLabel={`${sectionKey} height`}
                                            id={`${sectionKey}-height`}
                                            max={1200}
                                            min={60}
                                            onCommit={(value) =>
                                                onSectionChange(sectionKey, { height: value })
                                            }
                                            value={section.height}
                                        />
                                    </div>

                                    <div className="space-y-0.5 md:flex-2 shrink-0">
                                        <div className="text-sm font-medium">Background</div>
                                        <ColorInputField
                                            ariaLabel={`${sectionKey} background color`}
                                            // label="Background"
                                            onChange={(value) =>
                                                onSectionChange(sectionKey, {
                                                    backgroundColor: value,
                                                })
                                            }
                                            value={section.backgroundColor}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Image Layers</CardTitle>
                    <CardDescription>
                        Upload images to the main canvas, header, or footer, then drag and
                        resize them directly on the preview.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-[minmax(0,220px)_auto_auto] sm:items-end">
                        <div className="space-y-2">
                            <div className="text-sm font-medium">New Layer Destination</div>
                            <Select
                                onValueChange={(value) =>
                                    onNewLayerSectionChange(value as PhotoCardSectionId)
                                }
                                value={newLayerSection}
                            >
                                <SelectTrigger aria-label="New image section">
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

                        <Input
                            accept="image/*"
                            className="hidden"
                            id="photo-card-image-upload"
                            multiple
                            onChange={(event) => {
                                onUploadImages(event.target.files);
                                event.currentTarget.value = '';
                            }}
                            type="file"
                        />
                        <Button asChild type="button" variant="outline">
                            <label
                                className="inline-flex items-center gap-2 cursor-pointer"
                                htmlFor="photo-card-image-upload"
                            >
                                <Upload />
                                Upload Images
                            </label>
                        </Button>

                        <Badge className="h-9" variant="outline">
                            {config.images.length} layer(s)
                        </Badge>
                    </div>

                    {config.images.length > 0 ? (
                        <div className="space-y-3">
                            {config.images.map((layer, index) => (
                                <ImageLayerEditor
                                    canMoveDown={index < config.images.length - 1}
                                    canMoveUp={index > 0}
                                    index={index}
                                    isActive={activeImageId === layer.id}
                                    key={layer.id}
                                    layer={layer}
                                    onChange={(patch) => onImageChange(layer.id, patch)}
                                    onMoveDown={() => onImageMove(layer.id, 'down')}
                                    onMoveUp={() => onImageMove(layer.id, 'up')}
                                    onRemove={() => onImageRemove(layer.id)}
                                    onSelect={() => onSelectImage(layer.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyData
                            description="Upload JPG, PNG, WebP, or any browser-supported image. Each file becomes its own layer and can be resized from the preview."
                            Icon={ImagePlus}
                            title="No image layers yet"
                        />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <CardTitle>Text Layers</CardTitle>
                            <CardDescription>
                                Add text to the canvas, header, or footer, then drag it directly
                                in the stage.
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Select
                                onValueChange={(value) =>
                                    onNewLayerSectionChange(value as PhotoCardSectionId)
                                }
                                value={newLayerSection}
                            >
                                <SelectTrigger aria-label="New text section" className="w-40">
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
                            <Button onClick={onAddTextLayer} type="button" variant="outline">
                                <Type />
                                Add Text
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {config.texts.length > 0 ? (
                        <div className="space-y-3">
                            {config.texts.map((layer, index) => (
                                <TextLayerEditor
                                    canMoveDown={index < config.texts.length - 1}
                                    canMoveUp={index > 0}
                                    index={index}
                                    isActive={activeTextId === layer.id}
                                    key={layer.id}
                                    layer={layer}
                                    onChange={(patch) => onTextChange(layer.id, patch)}
                                    onMoveDown={() => onTextMove(layer.id, 'down')}
                                    onMoveUp={() => onTextMove(layer.id, 'up')}
                                    onRemove={() => onTextRemove(layer.id)}
                                    onSelect={() => onSelectText(layer.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyData
                            description="Add as many text layers as needed and position them visually from the preview instead of relying on raw coordinates."
                            Icon={Layers3}
                            title="No text layers yet"
                        />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Export</CardTitle>
                    <CardDescription>
                        Render the current canvas to an image file or save it locally.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Button onClick={() => onExport('image/png')} type="button">
                        <Download />
                        Download PNG
                    </Button>
                    <Button
                        onClick={() => onExport('image/jpeg')}
                        type="button"
                        variant="outline"
                    >
                        <Download />
                        Download JPEG
                    </Button>
                    <Button
                        disabled={savePending}
                        onClick={onSaveToIndexedDb}
                        type="button"
                        variant="secondary"
                    >
                        {savePending ? <Loader2 className="animate-spin" /> : <Save />}
                        Save
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="size-5" />
                        Saved Cards
                    </CardTitle>
                    <CardDescription>
                        Everything stays in this browser. You can reload a saved configuration
                        or export it later.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {savedCardsLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" />
                            Loading saved cards...
                        </div>
                    ) : savedCards.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {savedCards.map((card) => (
                                <div
                                    className="space-y-3 rounded-xl border p-1.5"
                                    key={card.id}
                                >
                                    <div className="overflow-hidden rounded-lg border bg-muted/30">
                                        {previewUrls[card.id] ? (
                                            // biome-ignore lint/performance/noImgElement: used only for preview thumbnails
                                            <img
                                                alt="Saved card preview"
                                                className="aspect-video w-full object-cover"
                                                src={previewUrls[card.id]}
                                            />
                                        ) : (
                                            <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">
                                                Preview unavailable
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            {card.config.width} × {card.config.height}px
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Saved {new Date(card.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        <Button
                                            onClick={() => onLoadSaved(card)}
                                            size="sm"
                                            type="button"
                                            variant="secondary"
                                        >
                                            Load
                                        </Button>
                                        <Button
                                            onClick={() => onDownloadSaved(card, 'image/png')}
                                            size="sm"
                                            type="button"
                                            variant="outline"
                                        >
                                            PNG
                                        </Button>
                                        <Button
                                            onClick={() => onDownloadSaved(card, 'image/jpeg')}
                                            size="sm"
                                            type="button"
                                            variant="outline"
                                        >
                                            JPEG
                                        </Button>
                                        <Button
                                            onClick={() => onDeleteSaved(card.id)}
                                            size="sm"
                                            type="button"
                                            variant="destructive"
                                        >
                                            <Trash2 />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyData
                            description="Save a finished card to keep a local archive for quick reloads and repeat downloads."
                            Icon={Database}
                            title="No saved cards yet"
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
