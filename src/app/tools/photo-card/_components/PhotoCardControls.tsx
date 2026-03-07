'use client';

import {
    Database,
    Download,
    ImagePlus,
    Layers3,
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
import { Input } from '@/components/ui/input';
import type { SavedPhotoCard } from '@/lib/photo-card/indexed-db';
import type { ImageLayer, PhotoCardConfig, TextLayer } from '@/lib/photo-card/types';
import ImageLayerEditor from './ImageLayerEditor';
import TextLayerEditor from './TextLayerEditor';

type Props = {
    activeImageId: string | null;
    activeTextId: string | null;
    config: PhotoCardConfig;
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
    onSaveToIndexedDb: () => void;
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
    onSaveToIndexedDb,
    onSelectImage,
    onSelectText,
    onTextChange,
    onTextMove,
    onTextRemove,
    onUploadImages,
}: Props) {
    return (
        <div className="space-y-6">
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
                        Set the output size and base background color.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="photo-card-width">
                            Width
                        </label>
                        <Input
                            aria-label="Canvas width"
                            id="photo-card-width"
                            max={4000}
                            min={120}
                            onChange={(event) =>
                                onCanvasChange({
                                    width: Number(event.target.value) || config.width,
                                })
                            }
                            type="number"
                            value={config.width}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="photo-card-height">
                            Height
                        </label>
                        <Input
                            aria-label="Canvas height"
                            id="photo-card-height"
                            max={4000}
                            min={120}
                            onChange={(event) =>
                                onCanvasChange({
                                    height: Number(event.target.value) || config.height,
                                })
                            }
                            type="number"
                            value={config.height}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Background</div>
                        <div className="flex items-center gap-2">
                            <Input
                                aria-label="Canvas background color swatch"
                                className="h-10 w-14 p-1"
                                onChange={(event) =>
                                    onCanvasChange({ backgroundColor: event.target.value })
                                }
                                type="color"
                                value={config.backgroundColor}
                            />
                            <Input
                                aria-label="Canvas background color hex value"
                                onChange={(event) =>
                                    onCanvasChange({ backgroundColor: event.target.value })
                                }
                                spellCheck={false}
                                value={config.backgroundColor}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Image Layers</CardTitle>
                    <CardDescription>
                        Upload one or more images and place them anywhere on the canvas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
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
                                className="inline-flex items-center gap-2"
                                htmlFor="photo-card-image-upload"
                            >
                                <Upload />
                                Upload Images
                            </label>
                        </Button>

                        <Badge variant="outline">{config.images.length} layer(s)</Badge>
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
                            description="Upload JPG, PNG, WebP, or any browser-supported image. Each file becomes its own layer."
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
                                Stack headlines, captions, or call-to-actions over the artwork.
                            </CardDescription>
                        </div>
                        <Button onClick={onAddTextLayer} type="button" variant="outline">
                            <Type />
                            Add Text
                        </Button>
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
                            description="Add as many text layers as needed for headlines, subtitles, or labels."
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
                        Save to IndexedDB
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
                        or export it again later.
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
                                <div className="space-y-3 rounded-xl border p-3" key={card.id}>
                                    <div className="overflow-hidden rounded-lg border bg-muted/30">
                                        {previewUrls[card.id] ? (
                                            // biome-ignore lint/performance/noImgElement: used only for preview
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

                                    <div className="flex flex-wrap gap-2">
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
                                            variant="ghost"
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
