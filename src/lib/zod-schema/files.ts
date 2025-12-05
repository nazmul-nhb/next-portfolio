'use client';

import { z } from 'zod';

const VALID_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/svg+xml',
    'image/gif',
] as const;

/** Image upload validation schema */
export const ImageSchema = z.custom<FileList>().refine(
    (fileList) => {
        if (typeof window === 'undefined') return true;

        if (!(fileList instanceof FileList)) return false;

        if (fileList.length === 0) return false;

        const file = fileList.item(0);

        if (!file) return false;

        const validTypeSet = new Set<string>(VALID_TYPES);

        return validTypeSet.has(file.type) && file.size <= 2 * 1024 * 1024;
    },
    {
        message: 'Please upload a valid image file (max 2MB, png/jpeg/jpg/svg/gif)!',
    }
);

export interface IFileListOptions {
    exactCount?: number;
    min?: number;
    max?: number;
    maxSizeMB?: number;
    allowedTypes?: Array<(typeof VALID_TYPES)[number]>;
}

/**
 * Creates a Zod schema for validating a FileList of images.
 *
 * @param options Options for validation like min/max/exact count and maxSize.
 */
export const createImageFileListSchema = (options: IFileListOptions) => {
    const {
        exactCount,
        min,
        max,
        maxSizeMB = 2,
        allowedTypes = VALID_TYPES.slice(0, 3),
    } = options ?? {};

    const typeSet = new Set<string>(allowedTypes);

    return z.custom<FileList>(
        (fileList) => {
            if (typeof window === 'undefined') return true;
            if (!(fileList instanceof FileList)) return false;

            const fileArray = Array.from(fileList);
            const fileCount = fileArray.length;

            if (exactCount !== undefined && fileCount !== exactCount) return false;
            if (min !== undefined && fileCount < min) return false;
            if (max !== undefined && fileCount > max) return false;

            return fileArray.every(
                (file) => typeSet.has(file.type) && file.size <= maxSizeMB * 1024 * 1024
            );
        },
        {
            error: `Upload ${
                exactCount
                    ? `exactly ${exactCount}`
                    : min && max
                      ? `between ${min} and ${max}`
                      : ''
            } valid image file(s) (max ${maxSizeMB}MB each).`,
        }
    );
};
