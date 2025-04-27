'use client';

import { z } from 'zod';

/** Image upload validation schema */
export const ImageSchema = z.any().refine(
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
