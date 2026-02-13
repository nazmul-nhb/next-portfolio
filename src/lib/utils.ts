import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ENV } from '@/configs/env';

/** Utility function to combine and merge Tailwind CSS class names. */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Utility function to build full Cloudinary image URL from DB path. */
export function buildCloudinaryUrl(urlFromDB: string) {
    return `${ENV.cloudinary.urls.base_url}${urlFromDB}`;
}
