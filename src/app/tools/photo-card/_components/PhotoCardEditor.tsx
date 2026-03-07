'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMount } from 'nhb-hooks';
import { getTimestamp, isBrowser } from 'nhb-toolbox';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { SavedPhotoCard } from '@/lib/photo-card/indexed-db';
import {
    deleteSavedPhotoCard,
    listSavedPhotoCards,
    savePhotoCard,
} from '@/lib/photo-card/indexed-db';
import {
    downloadBlob,
    getExportErrorMessage,
    renderPhotoCardToBlob,
} from '@/lib/photo-card/renderer';
import {
    createTextLayer,
    DEFAULT_PHOTO_CARD_CONFIG,
    type ImageLayer,
    type PhotoCardConfig,
    PhotoCardConfigSchema,
    type TextLayer,
} from '@/lib/photo-card/types';
import PhotoCardCanvas from './PhotoCardCanvas';
import PhotoCardControls from './PhotoCardControls';

function clampInteger(value: number, min: number, max: number, fallback: number) {
    if (!Number.isFinite(value)) return fallback;

    return Math.min(max, Math.max(min, Math.round(value)));
}

function normalizeColor(value: string, fallback: string) {
    return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : fallback;
}

function reorderItems<T extends { id: string }>(
    items: T[],
    id: string,
    direction: 'up' | 'down'
) {
    const index = items.findIndex((item) => item.id === id);

    if (index < 0) return items;

    const nextIndex = direction === 'up' ? index - 1 : index + 1;

    if (nextIndex < 0 || nextIndex >= items.length) return items;

    const nextItems = [...items];
    const [current] = nextItems.splice(index, 1);

    nextItems.splice(nextIndex, 0, current);

    return nextItems;
}

function fitImageToCanvas(
    naturalWidth: number,
    naturalHeight: number,
    config: PhotoCardConfig
) {
    const availableWidth = config.width * 0.9;
    const availableHeight = config.height * 0.9;
    const scale = Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight, 1);
    const width = Math.max(1, Math.round(naturalWidth * scale));
    const height = Math.max(1, Math.round(naturalHeight * scale));

    return {
        width,
        height,
        x: Math.round((config.width - width) / 2),
        y: Math.round((config.height - height) / 2),
    };
}

async function fileToDataUrl(file: File) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}.`));
        reader.readAsDataURL(file);
    });

    const dimensions = await new Promise<{ naturalWidth: number; naturalHeight: number }>(
        (resolve, reject) => {
            const image = new Image();

            image.onload = () =>
                resolve({
                    naturalWidth: image.naturalWidth,
                    naturalHeight: image.naturalHeight,
                });
            image.onerror = () => reject(new Error(`Failed to load ${file.name}.`));
            image.src = dataUrl;
        }
    );

    return {
        dataUrl,
        ...dimensions,
    };
}

function buildFilename(extension: 'png' | 'jpeg') {
    const date = getTimestamp().replaceAll(':', '-').replaceAll('.', '-');

    return `photo-card-${date}.${extension === 'jpeg' ? 'jpg' : extension}`;
}

export default function PhotoCardEditor() {
    const queryClient = useQueryClient();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [config, setConfig] = useState<PhotoCardConfig>(DEFAULT_PHOTO_CARD_CONFIG);
    const [activeImageId, setActiveImageId] = useState<string | null>(null);
    const [activeTextId, setActiveTextId] = useState<string | null>(
        DEFAULT_PHOTO_CARD_CONFIG.texts[0]?.id ?? null
    );

    const validation = useMemo(() => PhotoCardConfigSchema.safeParse(config), [config]);

    const savedCardsQuery = useQuery({
        enabled: isBrowser(),
        queryKey: ['photo-card', 'saved'],
        queryFn: listSavedPhotoCards,
    });

    const saveMutation = useMutation({
        mutationFn: savePhotoCard,
        onSuccess: () => {
            toast.success('Photo card saved locally.');
            void queryClient.invalidateQueries({ queryKey: ['photo-card', 'saved'] });
        },
        onError: (error) => {
            toast.error(getExportErrorMessage(error));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSavedPhotoCard,
        onSuccess: () => {
            toast.success('Saved card deleted.');
            void queryClient.invalidateQueries({ queryKey: ['photo-card', 'saved'] });
        },
        onError: (error) => {
            toast.error(getExportErrorMessage(error));
        },
    });

    const previewUrls = useMemo<Record<string, string>>(() => {
        const entries =
            savedCardsQuery.data?.map(
                (card) => [card.id, URL.createObjectURL(card.previewBlob)] as const
            ) ?? [];

        return Object.fromEntries(entries);
    }, [savedCardsQuery.data]);

    useEffect(() => {
        return () => {
            for (const url of Object.values(previewUrls)) {
                URL.revokeObjectURL(url);
            }
        };
    }, [previewUrls]);

    const validationIssues = validation.success
        ? []
        : validation.error.issues.map((issue) => issue.message);

    const updateCanvas = (
        patch: Partial<Pick<PhotoCardConfig, 'backgroundColor' | 'height' | 'width'>>
    ) => {
        setConfig((current) => ({
            ...current,
            width:
                patch.width == null
                    ? current.width
                    : clampInteger(Number(patch.width), 120, 4000, current.width),
            height:
                patch.height == null
                    ? current.height
                    : clampInteger(Number(patch.height), 120, 4000, current.height),
            backgroundColor:
                patch.backgroundColor == null
                    ? current.backgroundColor
                    : normalizeColor(patch.backgroundColor, current.backgroundColor),
        }));
    };

    const updateImageLayer = (id: string, patch: Partial<ImageLayer>) => {
        setConfig((current) => ({
            ...current,
            images: current.images.map((layer) =>
                layer.id === id
                    ? {
                          ...layer,
                          ...patch,
                          x:
                              patch.x == null
                                  ? layer.x
                                  : clampInteger(Number(patch.x), -5000, 5000, layer.x),
                          y:
                              patch.y == null
                                  ? layer.y
                                  : clampInteger(Number(patch.y), -5000, 5000, layer.y),
                          width:
                              patch.width == null
                                  ? layer.width
                                  : clampInteger(Number(patch.width), 1, 4000, layer.width),
                          height:
                              patch.height == null
                                  ? layer.height
                                  : clampInteger(Number(patch.height), 1, 4000, layer.height),
                      }
                    : layer
            ),
        }));
    };

    const updateTextLayer = (id: string, patch: Partial<TextLayer>) => {
        setConfig((current) => ({
            ...current,
            texts: current.texts.map((layer) =>
                layer.id === id
                    ? {
                          ...layer,
                          ...patch,
                          text: patch.text ?? layer.text,
                          color:
                              patch.color == null
                                  ? layer.color
                                  : normalizeColor(patch.color, layer.color),
                          fontSize:
                              patch.fontSize == null
                                  ? layer.fontSize
                                  : clampInteger(
                                        Number(patch.fontSize),
                                        8,
                                        400,
                                        layer.fontSize
                                    ),
                          x:
                              patch.x == null
                                  ? layer.x
                                  : clampInteger(Number(patch.x), -5000, 5000, layer.x),
                          y:
                              patch.y == null
                                  ? layer.y
                                  : clampInteger(Number(patch.y), -5000, 5000, layer.y),
                      }
                    : layer
            ),
        }));
    };

    const removeImageLayer = (id: string) => {
        setConfig((current) => ({
            ...current,
            images: current.images.filter((layer) => layer.id !== id),
        }));

        setActiveImageId((current) => (current === id ? null : current));
    };

    const removeTextLayer = (id: string) => {
        setConfig((current) => ({
            ...current,
            texts: current.texts.filter((layer) => layer.id !== id),
        }));

        setActiveTextId((current) => (current === id ? null : current));
    };

    const moveImageLayer = (id: string, direction: 'up' | 'down') => {
        setConfig((current) => ({
            ...current,
            images: reorderItems(current.images, id, direction),
        }));
    };

    const moveTextLayer = (id: string, direction: 'up' | 'down') => {
        setConfig((current) => ({
            ...current,
            texts: reorderItems(current.texts, id, direction),
        }));
    };

    const handleUploadImages = (files: FileList | null) => {
        if (!files?.length) return;

        void (async () => {
            try {
                const nextLayers = await Promise.all(
                    Array.from(files).map(async (file) => {
                        const loaded = await fileToDataUrl(file);
                        const fitted = fitImageToCanvas(
                            loaded.naturalWidth,
                            loaded.naturalHeight,
                            config
                        );

                        return {
                            id: crypto.randomUUID(),
                            src: loaded.dataUrl,
                            x: fitted.x,
                            y: fitted.y,
                            width: fitted.width,
                            height: fitted.height,
                            naturalWidth: loaded.naturalWidth,
                            naturalHeight: loaded.naturalHeight,
                        } satisfies ImageLayer;
                    })
                );

                setConfig((current) => ({
                    ...current,
                    images: [...current.images, ...nextLayers],
                }));
                setActiveImageId(nextLayers[0]?.id ?? null);
                toast.success(
                    `${nextLayers.length} image layer${nextLayers.length === 1 ? '' : 's'} added.`
                );
            } catch (error) {
                toast.error(getExportErrorMessage(error));
            }
        })();
    };

    const handleAddTextLayer = () => {
        const nextLayer = createTextLayer(config.texts.length);

        setConfig((current) => ({
            ...current,
            texts: [...current.texts, nextLayer],
        }));
        setActiveTextId(nextLayer.id);
    };

    const handleExport = (type: 'image/png' | 'image/jpeg') => {
        if (!validation.success) {
            toast.error(validationIssues[0] ?? 'Fix the photo card settings before exporting.');
            return;
        }

        void (async () => {
            try {
                const blob = await renderPhotoCardToBlob(validation.data, type);

                downloadBlob(blob, buildFilename(type === 'image/png' ? 'png' : 'jpeg'));
                toast.success(`Downloaded ${type === 'image/png' ? 'PNG' : 'JPEG'} export.`);
            } catch (error) {
                toast.error(getExportErrorMessage(error));
            }
        })();
    };

    const handleSaveToIndexedDb = () => {
        if (!validation.success) {
            toast.error(validationIssues[0] ?? 'Fix the photo card settings before saving.');
            return;
        }

        void (async () => {
            try {
                const blob = await renderPhotoCardToBlob(validation.data, 'image/png');

                await saveMutation.mutateAsync({
                    config: validation.data,
                    previewBlob: blob,
                });
            } catch (error) {
                if (!saveMutation.isError) {
                    toast.error(getExportErrorMessage(error));
                }
            }
        })();
    };

    const handleLoadSaved = (card: SavedPhotoCard) => {
        setConfig(card.config);
        setActiveImageId(card.config.images[0]?.id ?? null);
        setActiveTextId(card.config.texts[0]?.id ?? null);
        toast.success('Saved photo card loaded into the editor.');
    };

    const handleDownloadSaved = (card: SavedPhotoCard, type: 'image/png' | 'image/jpeg') => {
        void (async () => {
            try {
                const blob = await renderPhotoCardToBlob(card.config, type);

                downloadBlob(blob, buildFilename(type === 'image/png' ? 'png' : 'jpeg'));
                toast.success(
                    `Saved card exported as ${type === 'image/png' ? 'PNG' : 'JPEG'}.`
                );
            } catch (error) {
                toast.error(getExportErrorMessage(error));
            }
        })();
    };

    return useMount(
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <PhotoCardControls
                activeImageId={activeImageId}
                activeTextId={activeTextId}
                config={config}
                onAddTextLayer={handleAddTextLayer}
                onCanvasChange={updateCanvas}
                onDeleteSaved={(id) => deleteMutation.mutate(id)}
                onDownloadSaved={handleDownloadSaved}
                onExport={handleExport}
                onImageChange={updateImageLayer}
                onImageMove={moveImageLayer}
                onImageRemove={removeImageLayer}
                onLoadSaved={handleLoadSaved}
                onSaveToIndexedDb={handleSaveToIndexedDb}
                onSelectImage={setActiveImageId}
                onSelectText={setActiveTextId}
                onTextChange={updateTextLayer}
                onTextMove={moveTextLayer}
                onTextRemove={removeTextLayer}
                onUploadImages={handleUploadImages}
                previewUrls={previewUrls}
                savedCards={savedCardsQuery.data ?? []}
                savedCardsLoading={savedCardsQuery.isLoading}
                savePending={saveMutation.isPending}
                validationIssues={validationIssues}
            />

            <PhotoCardCanvas canvasRef={canvasRef} config={config} />
        </div>
    );
}
