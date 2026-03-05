/** biome-ignore-all lint/performance/noImgElement: lightweight thumbnails for gallery */

'use client';

import { isNumber } from 'nhb-toolbox';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { buildCloudinaryUrl } from '@/lib/utils';

type ReceiptGalleryProps = {
    receipts: string[];
    maxPreview?: number;
    previewOnly?: boolean;
};

function toImageUrl(src: string) {
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:')) {
        return src;
    }
    return buildCloudinaryUrl(src);
}

export function ReceiptGallery({
    maxPreview,
    receipts,
    previewOnly = false,
}: ReceiptGalleryProps) {
    const items = isNumber(maxPreview) ? receipts.slice(0, maxPreview) : receipts;

    if (items.length === 0) return null;

    return previewOnly ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
            {items.map((item, idx) => {
                const src = toImageUrl(item);

                return (
                    <img
                        alt={`Receipt ${idx + 1}`}
                        className="size-14 rounded-md border object-cover"
                        key={`${item}-${idx}`}
                        src={src}
                    />
                );
            })}
        </div>
    ) : (
        <PhotoProvider loop>
            <div className="flex gap-2 overflow-x-auto pb-1">
                {items.map((item, idx) => {
                    const src = toImageUrl(item);

                    return (
                        <PhotoView key={`${item}-${idx}`} src={src}>
                            <button className="shrink-0 cursor-zoom-in" type="button">
                                <img
                                    alt={`Receipt ${idx + 1}`}
                                    className="size-14 rounded-md border object-cover"
                                    src={src}
                                />
                            </button>
                        </PhotoView>
                    );
                })}
            </div>
        </PhotoProvider>
    );
}
