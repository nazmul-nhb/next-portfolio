import axios from 'axios';
import type { UploadApiResponse } from 'cloudinary';
import { generateRandomID, getTimestamp } from 'nhb-toolbox';
import { ENV } from '@/configs/env';
import { buildCloudinaryPublicId } from '@/lib/utils';
import type { Uncertain } from '@/types';
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
 * @param prefix The prefix to add at the start of the filename. Defaults to `'nhb'`.
 * @returns An object containing the secure URL and public ID of the uploaded file.
 */
export async function uploadToCloudinary(
    file: File | FileList,
    prefix = 'nhb'
): Promise<CloudinaryResponse> {
    const filename = generateRandomID({
        caseOption: 'lower',
        length: 8,
        prefix,
        separator: '-',
        suffix: getTimestamp().replace(/[:.]/g, '-'),
    });

    try {
        const { data } = await httpRequest<SignedData, { filename: string }>('/api/uploads', {
            method: 'POST',
            body: { filename },
        });

        const formData = new FormData();

        formData.append('file', file instanceof File ? file : (file.item(0) as File));
        formData.append('upload_preset', ENV.cloudinary.preset);
        formData.append('folder', ENV.cloudinary.folder);
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
        throw new Error('Failed to upload file to Cloudinary');
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
 * @param publicId The public ID of the file to delete.
 * @returns A promise that resolves when the file is deleted.
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
    try {
        const public_id = publicId.startsWith(`${ENV.cloudinary.folder}/`)
            ? publicId
            : buildCloudinaryPublicId(publicId);

        const res = await httpRequest<void, { public_id: string }>('/api/uploads', {
            method: 'DELETE',
            body: { public_id },
        });

        return res.success;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw new Error('Failed to delete file from Cloudinary');
    }
}

/**
 * Compares old and new Cloudinary public IDs and deletes the old file if they are different.
 * @param oldId The old Cloudinary public ID.
 * @param newId The new Cloudinary public ID.
 * @returns A promise that resolves when the comparison and deletion (if needed) is complete.
 */
export async function deleteOldCloudFile(oldId: Uncertain<string>, newId: Uncertain<string>) {
    if (newId && oldId && newId !== oldId) {
        await deleteFromCloudinary(oldId);
    }
}
