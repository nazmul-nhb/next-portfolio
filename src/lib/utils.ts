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
import type { $UTCOffset, TimeDuration } from 'nhb-toolbox/date/types';
import type { LooseLiteral } from 'nhb-toolbox/utils/types';
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

/**
 * * Type guard to check if a user role is `'admin'`.
 * @param role The user role to check, which can be uncertain and of type `string` or `UserRole`.
 * @returns `true` if the role is `'admin'`, otherwise `false`. This narrows the type to `'admin'` if true.
 */
export function isAdminUser(role: Uncertain<LooseLiteral<UserRole>>): role is 'admin' {
    return isNonEmptyString(role) && role === 'admin';
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

/** Type guard to check if an error object has a message property. */
export function hasErrorMessage(error: unknown): error is { message: string } {
    return isObjectWithKeys(error, ['message']) && isString(error.message);
}

/** Utility function to get the current year. */
export function getCurrentYear() {
    return new Date().getFullYear();
}

/** Utility function to build Open Graph image objects for metadata. */
export function buildOpenGraphImages(...urls: Array<Uncertain<string>>) {
    if (isArrayOfType(urls, isString)) {
        return urls.map((url) => {
            return {
                url,
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
export function eliminateEmptyStrings<T extends string>(arr: Uncertain<T>[]): T[] {
    return [...arr].filter(isNonEmptyString) as T[];
}

const _padAndFormat = (value: number, unit: string, pad = 2) => {
    const padded = String(value).padStart(pad, '0');

    return padded.concat(' ', unit);
};

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

    const parts: string[] = [];

    const weeks = Math.floor(ms / WEEK);
    if (weeks) parts.push(_padAndFormat(weeks, 'week'));
    ms %= WEEK;

    const days = Math.floor(ms / DAY);
    if (days) parts.push(_padAndFormat(days, 'day'));
    ms %= DAY;

    const hours = Math.floor(ms / HOUR);
    if (hours) parts.push(_padAndFormat(hours, 'hr'));
    ms %= HOUR;

    const minutes = Math.floor(ms / MINUTE);
    parts.push(_padAndFormat(minutes, 'min'));
    ms %= MINUTE;

    const seconds = Math.floor(ms / SECOND);
    parts.push(_padAndFormat(seconds, 'sec'));
    ms %= SECOND;

    parts.push(_padAndFormat(ms, 'ms', 3));

    return parts.join(' : ');
}

/**
 * Formats a {@link TimeDuration} object into a human-readable string, omitting zero values.
 * @param duration An object containing time units (years, months, days, hours, minutes, seconds and milliseconds).
 * @returns A formatted string like "01 year : 03 months : 05 days : 12 hr : 30 min : 45 sec".
 */
export function parseToDurationString(duration: TimeDuration): string {
    const { days, hours, minutes, months, seconds, years } = duration;

    const parts: string[] = [];

    if (years) parts.push(_padAndFormat(years, 'year'));

    if (months) parts.push(_padAndFormat(months, 'month'));

    if (days) parts.push(_padAndFormat(days, 'day'));

    if (hours) parts.push(_padAndFormat(hours, 'hr'));

    parts.push(_padAndFormat(minutes, 'min'));

    parts.push(_padAndFormat(seconds, 'sec'));

    return parts.join(' : ');
}

/** Format a Date object into a string suitable for datetime-local input value (e.g., `"2024-06-30T14:30"`). */
export function toDateTimeLocalValue(date: string | Date = new Date()) {
    const chr = new Chronos(date);

    return chr.toLocalISOString().split('.')[0];
}

/**
 * Build a datetime-local string with a specific UTC offset (e.g., `"2024-06-30T14:30:00.000+02:00"`).
 * @param dateTime The date and time to format (string or Date).
 * @param offset The UTC offset in the format "+hh:mm" or "-hh:mm".
 * @returns A formatted datetime string with the specified UTC offset.
 */
export function buildLocalISOString(dateTime: Uncertain<string | Date>, offset: $UTCOffset) {
    if (!dateTime) return undefined;

    return `${dateTime}.000${offset}`;
}

/** Parses a datetime-local input value into a Date object, or returns null if invalid. */
export function parseDateTimeLocal(value: Uncertain<string>) {
    if (!value) return null;

    const parsedDate = new Date(value);

    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}
