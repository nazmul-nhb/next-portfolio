import { type ClassValue, clsx } from 'clsx';
import { formatDate, getLastArrayElement } from 'nhb-toolbox';
import { twMerge } from 'tailwind-merge';
import { ENV } from '@/configs/env';
import type { Uncertain } from '@/types';

/** Utility function to combine and merge Tailwind CSS class names. */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Utility function to check if the current pathname is an admin path.
 * @param pathname The current pathname (e.g., `window.location.pathname`).
 * @returns `true` if the pathname starts with `/admin`, otherwise `false`.
 */
export function isAdminPath(pathname: string) {
    return pathname.startsWith('/admin');
}

/** Utility function to build full Cloudinary image URL from DB path. */
export function buildCloudinaryUrl(urlFromDB: string) {
    return `${ENV.cloudinary.urls.base_url}${urlFromDB}`;
}

/** Utility function to extract Cloudinary public ID from DB URL for transformations. */
export function buildCloudinaryPublicId(urlFromDB: string) {
    return urlFromDB.slice(urlFromDB.indexOf('/') + 1, urlFromDB.lastIndexOf('.'));
}

/**
 * Converts a given cloudinary image path to a File object.
 * @param imgPath The image path stored in the database (e.g., `"v1234567890/folder/image.jpg"`).
 * @returns A promise that resolves to a File object.
 */
export async function pathToFile(imgPath: string) {
    const url = buildCloudinaryUrl(imgPath);
    const filename = getLastArrayElement(imgPath.split('/')) as string;

    const response = await fetch(url);
    // Get the MIME type from the response headers or hardcode if known
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    const blob = await response.blob();
    // The File constructor takes a Blob, name, and options
    return new File([blob], filename, { type: mimeType });
}

/**
 * Constructs a list of File objects (mimicking FileList behavior) from an array of image paths stored in the database.
 * @param imgPaths An array of image paths stored in the database (e.g., `["v1234567890/folder/image1.jpg", "v1234567890/folder/image2.png"]`).
 * @returns A promise that resolves to an array of File objects.
 */
export async function constructFileListFromPaths(imgPaths: string[]): Promise<FileList> {
    const filesArray = await Promise.all(imgPaths.map(pathToFile));

    const dataTransfer = new DataTransfer();

    for (const file of filesArray) {
        dataTransfer.items.add(file);
    }

    return dataTransfer.files;
}

/**
 * * Formats a duration string given start and end dates, handling "Present" for ongoing durations.
 * @param startDate The start date of the duration (`string` or `Date`).
 * @param endDate The end date of the duration (`string` or `Date`). If `null` or `undefined`, it will be treated as `"Present"`.
 * @returns A formatted string like `"Jan 2020 - Present"` or `"Jan 2020 - Dec 2021"`.
 */
export function formatDuration(startDate: string | Date, endDate: Uncertain<string | Date>) {
    const start = formatDate({ date: startDate, format: 'mmm yyyy' });

    const end = endDate ? formatDate({ date: endDate, format: 'mmm yyyy' }) : 'Present';

    return `${start} - ${end}`;
}

/** Format a date as a relative time string */
export function formatRelativeTime(date: Date | string) {
    const now = Date.now();
    const then = new Date(date).getTime();
    const diff = now - then;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return formatDate({ date, format: 'mmm D, yyyy hh:mm a' });
}
