import axios from 'axios';
import type { UploadApiResponse } from 'cloudinary';
import { generateRandomID } from 'nhb-toolbox';
import { ENV } from '@/configs/env';
import { httpRequest } from './baseRequest';

/** - Response from `Cloudinary` after uploading a file successfully. */
export interface CloudinaryResponse {
    url: string;
    public_id: string;
}

/** - Signed data from server before uploading file to `Cloudinary`. */
export interface SignedData {
    signature: string;
    timestamp: number;
}

/**
 * * Uploads a file to Cloudinary and returns the uploaded file's URL and public ID.
 * @param file The file to upload.
 * @param suffix The suffix to append to the file name. Defaults to `'nhb'`.
 * @returns An object containing the secure URL and public ID of the uploaded image.
 */
export async function uploadToCloudinary(
    file: File | FileList,
    suffix = 'nhb'
): Promise<CloudinaryResponse> {
    const filename = generateRandomID({
        caseOption: 'lower',
        length: 8,
        prefix: 'portfolio',
        suffix,
        separator: '-',
        timeStamp: true,
    });

    try {
        const { data } = await httpRequest<SignedData, { filename: string }>('/api/uploads', {
            method: 'POST',
            body: { filename },
        });

        const formData = new FormData();

        formData.append('file', file instanceof File ? file : (file.item(0) as File));
        formData.append('upload_preset', 'portfolio');
        formData.append('folder', 'portfolio');
        formData.append('api_key', ENV.cloudinary.config.api_key);
        formData.append('public_id', filename);
        formData.append('timestamp', String(data?.timestamp));
        formData.append('signature', String(data?.signature));

        const response = await axios.post<UploadApiResponse>(
            ENV.cloudinary.urls.upload_url,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return {
            url: response.data.secure_url.split(ENV.cloudinary.urls.base_url)[1],
            public_id: response.data.public_id,
        };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
}

/**
 * * Uploads multiple files to Cloudinary and returns their URLs and public IDs.
 * @param files A FileList or array of Files.
 * @param suffix Optional suffix for each filename. Defaults to `'nhb'`.
 * @returns Array of CloudinaryResponse for each uploaded file.
 */
export async function uploadMultipleToCloudinary(
    files: FileList | File[],
    suffix?: string
): Promise<CloudinaryResponse[]> {
    const filesArray = Array.from(files);

    const uploads = filesArray.map((file) => uploadToCloudinary(file, suffix));

    return Promise.all(uploads);
}

/**
 * Deletes a file from Cloudinary by public ID.
 * @param public_id The public ID of the image to delete.
 * @returns A promise that resolves when the image is deleted.
 */
export async function deleteFromCloudinary(public_id: string): Promise<void> {
    try {
        const res = await httpRequest<void, { public_id: string }>('/api/uploads', {
            method: 'PUT',
            body: { public_id },
        });

        return res.data;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw new Error('Failed to delete image from Cloudinary');
    }
}
