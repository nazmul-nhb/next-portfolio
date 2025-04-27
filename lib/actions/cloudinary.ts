import type { UploadApiResponse } from 'cloudinary';

import axios from 'axios';
import { generateRandomID } from 'nhb-toolbox';

import { httpRequest } from './baseRequest';

import { cloudinaryUrls } from '@/constants';

export interface CloudinaryResponse {
	url: string;
	publicId: string;
}

/**
 * Uploads a file to Cloudinary and returns the uploaded file's URL and public ID.
 * @param file The file to upload.
 * @param suffix The suffix to append to the file name.
 * @returns An object containing the secure URL and public ID of the uploaded image.
 */
export async function uploadToCloudinary(
	file: File,
	suffix: string
): Promise<CloudinaryResponse> {
	const filename = generateRandomID({
		caseOption: 'lower',
		length: 8,
		prefix: 'portfolio',
		suffix,
		separator: '-',
		timeStamp: true,
	});

	const formData = new FormData();

	formData.append('file', file);
	formData.append('upload_preset', 'portfolio');
	formData.append('folder', 'portfolio');
	formData.append('public_id', filename);

	try {
		const response = await axios.post<UploadApiResponse>(
			cloudinaryUrls.upload_url,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);

		return {
			url: response.data.secure_url.split(cloudinaryUrls.base_url)[1],
			publicId: response.data.public_id,
		};
	} catch (error) {
		console.error('Error uploading to Cloudinary:', error);
		throw new Error('Failed to upload image to Cloudinary');
	}
}

/**
 * Deletes a file from Cloudinary by public ID.
 * @param publicId The public ID of the image to delete.
 * @returns A promise that resolves when the image is deleted.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
	try {
		const res = await httpRequest<void, { publicId: string }>(
			'/api/delete-cloudinary',
			{
				method: 'POST',
				body: { publicId },
			}
		);

		return res.data;
	} catch (error) {
		console.error('Error deleting from Cloudinary:', error);
		throw new Error('Failed to delete image from Cloudinary');
	}
}
