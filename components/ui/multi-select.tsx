'use client';

import CreatableSelect from 'react-select/creatable';
import { useTheme } from 'next-themes';
import clsx from 'clsx';
import type { FC } from 'react';
import type { MultiValue, Props as SelectProps } from 'react-select';

/**
 * Props for reusable CreatableSelectInput component
 */
interface CreatableSelectInputProps
	extends Omit<
		SelectProps<{ label: string; value: string }, true>,
		'value' | 'onChange'
	> {
	/**
	 * Label shown above the select input
	 */
	label?: string;

	/**
	 * Error message displayed below the field
	 */
	error?: string;

	/**
	 * Field value: an array of strings
	 */
	value: string[];

	/**
	 * Handler when selection changes
	 */
	onChange: (values: string[]) => void;

	/**
	 * Optional className to apply to the wrapper
	 */
	className?: string;
	name?: string;
	placeholder?: string;
	errorMessage?: string;
	isInvalid?: boolean;
	isDisabled?: boolean;
}

/**
 * Reusable creatable multi-select input compatible with HeroUI styles and dark mode
 */
const CreatableSelectInput: FC<CreatableSelectInputProps> = ({
	name,
	value,
	onChange,
	label,
	placeholder,
	errorMessage,
	isInvalid,
	isDisabled,
}) => {
	const { resolvedTheme } = useTheme();

	const options = value.map((v) => ({ label: v, value: v }));

	return (
		<div className="space-y-1">
			{label && (
				<label
					htmlFor={name}
					className="block text-sm font-medium text-gray-700 dark:text-gray-200"
				>
					{label}
				</label>
			)}
			<CreatableSelect
				inputId={name}
				isMulti
				isDisabled={isDisabled}
				value={options}
				onChange={(vals) => onChange(vals.map((v) => v.value))}
				placeholder={placeholder}
				classNames={{
					control: () =>
						clsx(
							'border rounded-md px-2 py-1.5 text-sm shadow-sm',
							'dark:bg-gray-800 dark:border-gray-600 dark:text-white',
							isInvalid
								? 'border-red-500 dark:border-red-400'
								: 'border-gray-300'
						),
					menu: () =>
						'bg-white dark:bg-gray-900 border mt-1 rounded-md shadow-lg z-50 text-sm',
					option: ({ isFocused }) =>
						clsx('px-3 py-2 cursor-pointer', {
							'bg-gray-100 dark:bg-gray-700': isFocused,
							'text-gray-900 dark:text-white': true,
						}),
					multiValue: () =>
						'bg-gray-200 dark:bg-gray-700 text-sm rounded px-2 py-0.5',
					multiValueLabel: () => 'text-gray-800 dark:text-gray-100',
					multiValueRemove: () => 'hover:text-red-500 cursor-pointer',
				}}
				theme={(baseTheme) => ({
					...baseTheme,
					colors: {
						...baseTheme.colors,
						primary: resolvedTheme === 'dark' ? '#60a5fa' : '#2563eb', // tailwind blue-400/600
						neutral0: resolvedTheme === 'dark' ? '#1f2937' : '#fff',
						neutral80: resolvedTheme === 'dark' ? '#f9fafb' : '#111827',
					},
				})}
			/>
			{isInvalid && errorMessage && (
				<p className="text-sm text-red-500">{errorMessage}</p>
			)}
		</div>
	);
};

export default CreatableSelectInput;
