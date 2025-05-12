'use client';

import { z } from 'zod';

/** Image upload validation schema */
export const ImageSchema = z.custom<FileList>().refine(
	(fileList) => {
		if (typeof window === 'undefined') {
			// Server side: skip validation
			return true;
		}
		if (!(fileList instanceof FileList)) {
			return false;
		}
		if (fileList.length === 0) return false;

		const file = fileList.item(0);

		if (!file) return false;

		const validTypes = [
			'image/png',
			'image/jpeg',
			'image/jpg',
			'image/svg+xml',
			'image/gif',
		];

		return validTypes.includes(file.type) && file.size <= 2 * 1024 * 1024;
	},
	{
		message: 'Please upload a valid image file (max 2MB, png/jpeg/jpg/svg/gif)!',
	}
);

export interface IFileListSchema {
	exactCount?: number;
	min?: number;
	max?: number;
	maxSizeMB?: number;
	allowedTypes?: (
		| 'image/png'
		| 'image/jpeg'
		| 'image/jpg'
		| 'image/svg+xml'
		| 'image/gif'
	)[];
}

/**
 * Creates a Zod schema for validating a FileList of images.
 *
 * @param options Options for validation like min/max/exact count and maxSize.
 */
export const createImageFileListSchema = (options: IFileListSchema) => {
	const {
		exactCount,
		min,
		max,
		maxSizeMB = 2,
		allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'],
	} = options ?? {};

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
				(file) =>
					(allowedTypes as string[]).includes(file.type) &&
					file.size <= maxSizeMB * 1024 * 1024
			);
		},
		{
			message: `Upload ${
				exactCount
					? `exactly ${exactCount}`
					: min && max
					? `between ${min} and ${max}`
					: ''
			} valid image file(s) (max ${maxSizeMB}MB each).`,
		}
	);
};
