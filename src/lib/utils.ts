import { type ClassValue, clsx } from 'clsx';
import type { Route } from 'next';
import {
    Chronos,
    formatDate,
    getLastArrayElement,
    isArrayOfType,
    isNonEmptyString,
    isObjectWithKeys,
    isString,
} from 'nhb-toolbox';
import type { Percent } from 'nhb-toolbox/number/types';
import type { ValidArray } from 'nhb-toolbox/types';
import { twMerge } from 'tailwind-merge';
import { ENV } from '@/configs/env';
import { siteConfig } from '@/configs/site';
import type { Uncertain, UserRole } from '@/types';
import type { Message } from '@/types/messages';

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

export function isValidRole(role: Uncertain<string>): role is UserRole {
    return isString(role) && ([...siteConfig.userRoles] as string[]).includes(role);
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

/** Group messages by date for Telegram-style date separators. */
export function groupMessagesByDate(messages: Message[]) {
    const groups: Array<{ date: string; msgs: Message[] }> = [];

    for (const msg of messages) {
        const dateLabel = getDateLabel(msg.created_at);
        const lastGroup = groups[groups.length - 1];

        if (lastGroup && lastGroup.date === dateLabel) {
            lastGroup.msgs.push(msg);
        } else {
            groups.push({ date: dateLabel, msgs: [msg] });
        }
    }

    return groups;
}

/** Get a human-readable date label (Today, Yesterday, or full date). */
export function getDateLabel(dateStr: string): string {
    const date = new Chronos(dateStr);
    const now = new Chronos();

    if (date.isToday()) return 'Today';
    if (date.isYesterday()) return 'Yesterday';

    // Same year
    if (date.year === now.year) {
        return date.format('mmm DD');
    }

    return date.format('mmm DD, YYYY');
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

/** Type guard to check if an error object has a message property. */
export function hasErrorMessage(error: unknown): error is { message: string } {
    return isObjectWithKeys(error, ['message']) && isString(error.message);
}

/** Utility function to get the current year. */
export function getCurrentYear() {
    return new Date().getFullYear();
}

/** Utility function to build Open Graph image objects for metadata. */
export function buildOpenGraphImages(...urls: ValidArray<Uncertain<string>>) {
    if (isArrayOfType(urls, isString)) {
        return urls.map((url) => {
            return {
                url: url as string,
                alt: siteConfig.name,
                width: 1200,
                height: 630,
            };
        });
    }
}

/** Build the canonical absolute URL. */
export function buildCanonicalUrl(pathname: Route): string {
    return new URL(pathname, siteConfig.baseUrl).toString();
}

/** Utility function to strip HTML tags from a string and convert `<br>` to newlines. */
export function stripHtml(input: unknown) {
    const html = input == null ? '' : isNonEmptyString(input) ? input : String(input);

    return html
        .replace(/\r\n?/g, '\n') // normalize line endings FIRST
        .replace(/<br\s*\/?>/gi, '\n') // <br> → newline
        .replace(/<\/?[^>]+(>|$)/g, '') // remove HTML tags
        .replace(/[^\S\n]+/g, ' ') // collapse spaces/tabs only
        .replace(/\n[^\S\n]+/g, '\n') // remove indentation
        .replace(/\n{3,}/g, '\n\n') // limit blank lines
        .trim();
}

/** Utility function to eliminate empty strings from an array. */
export function eliminateEmptyStrings(arr: Uncertain<string>[]): string[] {
    return [...arr].filter(isNonEmptyString);
}

/**
 * Converts milliseconds to a human readable duration string.
 *
 * Units supported: weeks → milliseconds.
 * Zero values are omitted from the output.
 */
export function parseMsToDuration(ms: number): string {
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    const DAY = 24 * 60 * 60 * 1000;
    const HOUR = 60 * 60 * 1000;
    const MINUTE = 60 * 1000;
    const SECOND = 1000;

    const padAndFormat = (value: number, unit: string, pad = 2) => {
        const padded = String(value).padStart(pad, '0');

        return padded.concat(' ', unit);
    };

    const parts: string[] = [];

    const weeks = Math.floor(ms / WEEK);
    if (weeks) parts.push(padAndFormat(weeks, 'week'));
    ms %= WEEK;

    const days = Math.floor(ms / DAY);
    if (days) parts.push(padAndFormat(days, 'day'));
    ms %= DAY;

    const hours = Math.floor(ms / HOUR);
    if (hours) parts.push(padAndFormat(hours, 'hr'));
    ms %= HOUR;

    const minutes = Math.floor(ms / MINUTE);
    parts.push(padAndFormat(minutes, 'min'));
    ms %= MINUTE;

    const seconds = Math.floor(ms / SECOND);
    parts.push(padAndFormat(seconds, 'sec'));
    ms %= SECOND;

    parts.push(String(ms).padStart(3, '0').concat(' ms'));

    return parts.join(' : ');
}

/**
 * Convert opacity (0–100) to hex alpha
 */
export function opacityToHex(opacity: Percent): string {
    const value = Math.round((Math.min(Math.max(opacity, 0), 100) / 100) * 255);
    return value.toString(16).padStart(2, '0').toUpperCase();
}
