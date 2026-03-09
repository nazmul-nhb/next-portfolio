'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMount } from 'nhb-hooks';
import { uuid } from 'nhb-toolbox/hash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PHOTO_CARD_SECTION_LABELS } from '@/lib/photo-card/constants';
import type { SavedPhotoCard } from '@/lib/photo-card/indexed-db';
import {
    deleteSavedPhotoCard,
    listSavedPhotoCards,
    savePhotoCard,
} from '@/lib/photo-card/indexed-db';
import { clampLayerPositionToSection, getSectionBounds } from '@/lib/photo-card/layout';
import {
    downloadBlob,
    getExportErrorMessage,
    measureTextLayer,
    renderPhotoCardToBlob,
} from '@/lib/photo-card/renderer';
import { PhotoCardConfigSchema } from '@/lib/photo-card/schema';
import type {
    ImageLayer,
    PhotoCardConfig,
    PhotoCardSectionConfig,
    PhotoCardSectionId,
    TextLayer,
} from '@/lib/photo-card/types';
import {
    createTextLayer,
    DEFAULT_PHOTO_CARD_CONFIG,
    normalizePhotoCardConfig,
} from '@/lib/photo-card/utils';
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

function withSectionEnabled(
    config: PhotoCardConfig,
    section: PhotoCardSectionId
): PhotoCardConfig {
    if (section === 'canvas') return config;

    return {
        ...config,
        sections: {
            ...config.sections,
            [section]: {
                ...config.sections[section],
                enabled: true,
            },
        },
    };
}

function fitImageToSection(
    naturalWidth: number,
    naturalHeight: number,
    config: PhotoCardConfig,
    section: PhotoCardSectionId
) {
    const draftConfig = withSectionEnabled(config, section);
    const bounds = getSectionBounds(draftConfig, section);
    const availableWidth = bounds.width * 0.9;
    const availableHeight = bounds.height * 0.9;
    const scale = Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight, 1);
    const width = Math.max(1, Math.round(naturalWidth * scale));
    const height = Math.max(1, Math.round(naturalHeight * scale));

    return {
        width,
        height,
        x: Math.round((bounds.width - width) / 2),
        y: Math.round((bounds.height - height) / 2),
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
    const date = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');

    return `photo-card-${date}.${extension === 'jpeg' ? 'jpg' : extension}`;
}

export default function PhotoCardEditor() {
    const isBrowser = typeof window !== 'undefined';
    const queryClient = useQueryClient();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [config, setConfig] = useState<PhotoCardConfig>(() =>
        normalizePhotoCardConfig(DEFAULT_PHOTO_CARD_CONFIG)
    );
    const [activeImageId, setActiveImageId] = useState<string | null>(null);
    const [activeTextId, setActiveTextId] = useState<string | null>(
        DEFAULT_PHOTO_CARD_CONFIG.texts[0]?.id ?? null
    );
    const [newLayerSection, setNewLayerSection] = useState<PhotoCardSectionId>('canvas');

    const validation = useMemo(() => PhotoCardConfigSchema.safeParse(config), [config]);

    const savedCardsQuery = useQuery({
        enabled: isBrowser,
        queryKey: ['photo-card', 'saved'],
        queryFn: listSavedPhotoCards,
    });

    const savedCards = useMemo<SavedPhotoCard[]>(() => {
        return (savedCardsQuery.data ?? []).map((card) => ({
            ...card,
            config: normalizePhotoCardConfig(card.config),
        }));
    }, [savedCardsQuery.data]);

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
        const entries = savedCards.map(
            (card) => [card.id, URL.createObjectURL(card.previewBlob)] as const
        );

        return Object.fromEntries(entries);
    }, [savedCards]);

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

    const updateSection = (
        section: 'header' | 'footer',
        patch: Partial<PhotoCardSectionConfig>
    ) => {
        setConfig((current) => ({
            ...current,
            sections: {
                ...current.sections,
                [section]: {
                    ...current.sections[section],
                    ...patch,
                    height:
                        patch.height == null
                            ? current.sections[section].height
                            : clampInteger(
                                  Number(patch.height),
                                  60,
                                  1200,
                                  current.sections[section].height
                              ),
                    backgroundColor:
                        patch.backgroundColor == null
                            ? current.sections[section].backgroundColor
                            : normalizeColor(
                                  patch.backgroundColor,
                                  current.sections[section].backgroundColor
                              ),
                },
            },
        }));
    };

    const updateImageLayer = (id: string, patch: Partial<ImageLayer>) => {
        setConfig((current) => {
            const nextConfig = patch.section
                ? withSectionEnabled(current, patch.section)
                : current;

            return {
                ...nextConfig,
                images: nextConfig.images.map((layer) => {
                    if (layer.id !== id) return layer;

                    const nextLayer: ImageLayer = {
                        ...layer,
                        ...patch,
                        section: patch.section ?? layer.section,
                        width:
                            patch.width == null
                                ? layer.width
                                : clampInteger(Number(patch.width), 1, 4000, layer.width),
                        height:
                            patch.height == null
                                ? layer.height
                                : clampInteger(Number(patch.height), 1, 4000, layer.height),
                    };
                    const nextPosition = clampLayerPositionToSection(
                        nextConfig,
                        nextLayer.section,
                        nextLayer.width,
                        nextLayer.height,
                        patch.x ?? layer.x,
                        patch.y ?? layer.y
                    );

                    return {
                        ...nextLayer,
                        ...nextPosition,
                    };
                }),
            };
        });
    };

    const updateTextLayer = (id: string, patch: Partial<TextLayer>) => {
        setConfig((current) => {
            const nextConfig = patch.section
                ? withSectionEnabled(current, patch.section)
                : current;

            return {
                ...nextConfig,
                texts: nextConfig.texts.map((layer) => {
                    if (layer.id !== id) return layer;

                    const nextLayer: TextLayer = {
                        ...layer,
                        ...patch,
                        text: patch.text ?? layer.text,
                        section: patch.section ?? layer.section,
                        color:
                            patch.color == null
                                ? layer.color
                                : normalizeColor(patch.color, layer.color),
                        fontSize:
                            patch.fontSize == null
                                ? layer.fontSize
                                : clampInteger(Number(patch.fontSize), 8, 400, layer.fontSize),
                    };
                    const metrics = measureTextLayer(nextLayer);
                    const nextPosition = clampLayerPositionToSection(
                        nextConfig,
                        nextLayer.section,
                        metrics.width,
                        metrics.height,
                        patch.x ?? layer.x,
                        patch.y ?? layer.y
                    );

                    return {
                        ...nextLayer,
                        ...nextPosition,
                    };
                }),
            };
        });
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

    const handleAddImages = (
        files: FileList | File[] | null,
        targetSection: PhotoCardSectionId = 'canvas'
    ) => {
        const fileArray =
            files instanceof FileList ? Array.from(files) : Array.isArray(files) ? files : [];

        if (!fileArray.length) return;

        void (async () => {
            try {
                const nextLayers = await Promise.all(
                    fileArray.map(async (file) => {
                        const loaded = await fileToDataUrl(file);
                        const fitted = fitImageToSection(
                            loaded.naturalWidth,
                            loaded.naturalHeight,
                            config,
                            targetSection
                        );

                        return {
                            id: uuid(),
                            section: targetSection,
                            src: loaded.dataUrl,
                            x: fitted.x,
                            y: fitted.y,
                            width: fitted.width,
                            height: fitted.height,
                            naturalWidth: loaded.naturalWidth,
                            naturalHeight: loaded.naturalHeight,
                            maintainAspectRatio: true,
                        } satisfies ImageLayer;
                    })
                );

                setConfig((current) => {
                    const nextConfig = withSectionEnabled(current, targetSection);

                    return {
                        ...nextConfig,
                        images: [...nextConfig.images, ...nextLayers],
                    };
                });
                setActiveImageId(nextLayers[0]?.id ?? null);
                toast.success(
                    `${nextLayers.length} image layer${nextLayers.length === 1 ? '' : 's'} added to ${PHOTO_CARD_SECTION_LABELS[targetSection].toLowerCase()}.`
                );
            } catch (error) {
                toast.error(getExportErrorMessage(error));
            }
        })();
    };

    const handleUploadImages = (files: FileList | null) => {
        if (!files?.length) return;
        handleAddImages(files, newLayerSection);
    };

    const handleAddTextLayer = () => {
        const targetSection = newLayerSection;
        const sectionCount = config.texts.filter(
            (layer) => layer.section === targetSection
        ).length;
        const nextLayer = createTextLayer(sectionCount, targetSection);

        setConfig((current) => {
            const nextConfig = withSectionEnabled(current, targetSection);

            return {
                ...nextConfig,
                texts: [...nextConfig.texts, nextLayer],
            };
        });
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
        const normalizedConfig = normalizePhotoCardConfig(card.config);

        setConfig(normalizedConfig);
        setActiveImageId(normalizedConfig.images[0]?.id ?? null);
        setActiveTextId(normalizedConfig.texts[0]?.id ?? null);
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
        <div className="mx-auto max-w-full xl:h-[calc(100vh-6rem)] grid gap-4 grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="xl:overflow-y-auto custom-scroll xl:border xl:p-1">
                <PhotoCardControls
                    activeImageId={activeImageId}
                    activeTextId={activeTextId}
                    config={config}
                    newLayerSection={newLayerSection}
                    onAddTextLayer={handleAddTextLayer}
                    onCanvasChange={updateCanvas}
                    onDeleteSaved={(id) => deleteMutation.mutate(id)}
                    onDownloadSaved={handleDownloadSaved}
                    onExport={handleExport}
                    onImageChange={updateImageLayer}
                    onImageMove={moveImageLayer}
                    onImageRemove={removeImageLayer}
                    onLoadSaved={handleLoadSaved}
                    onNewLayerSectionChange={setNewLayerSection}
                    onSaveToIndexedDb={handleSaveToIndexedDb}
                    onSectionChange={updateSection}
                    onSelectImage={setActiveImageId}
                    onSelectText={setActiveTextId}
                    onTextChange={updateTextLayer}
                    onTextMove={moveTextLayer}
                    onTextRemove={removeTextLayer}
                    onUploadImages={handleUploadImages}
                    previewUrls={previewUrls}
                    savedCards={savedCards}
                    savedCardsLoading={savedCardsQuery.isLoading}
                    savePending={saveMutation.isPending}
                    validationIssues={validationIssues}
                />
            </div>

            <PhotoCardCanvas
                activeImageId={activeImageId}
                activeTextId={activeTextId}
                canvasRef={canvasRef}
                config={config}
                onAddImages={handleAddImages}
                onImageChange={updateImageLayer}
                onSelectImage={setActiveImageId}
                onSelectText={setActiveTextId}
                onTextChange={updateTextLayer}
            />
        </div>
    );
}
