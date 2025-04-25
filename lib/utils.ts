import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * * Utility function to conditionally merge Tailwind CSS class names.
 *
 * - Uses `clsx` to handle conditional class logic.
 * - Uses `twMerge` to intelligently merge conflicting Tailwind classes (e.g., `px-2 px-4` → `px-4`).
 *
 * @param inputs - A list of class values (strings, arrays, objects).
 * @returns A single merged class string, ready for use in `className`.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
