'use client';

import CreatableMultiSelect from '@/components/ui/multi-select';
import { Button, DatePicker, Form, Input, Textarea } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseDate, today } from '@internationalized/date';
import { isEmptyObject } from 'nhb-toolbox';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { createProject } from '../../lib/actions/api.projects';
import { deleteFromCloudinary, uploadToCloudinary } from '../../lib/actions/cloudinary';
import { ProjectCreationFields } from '../../schema/project.schema';
import type { TProjectFields } from '../../types/project.types';

interface Props {
	closeModalAction: () => void;
}

/**
 * Project Creation/Update Form Component
 */
export default function ProjectForm({ closeModalAction }: Props) {
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		control,
		watch,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<TProjectFields>({
		resolver: zodResolver(ProjectCreationFields),
	});

	const onSubmit = async (data: TProjectFields) => {
		console.log(data);
		try {
			setError(null);

			// Upload favicon (single)
			const faviconRes = await uploadToCloudinary(data.favicon, 'favicon');

			if (isEmptyObject(faviconRes)) {
				return console.error('Favicon upload failed!');
			}

			// Upload screenshots (multiple)
			const screenshotsRes = await Promise.all(
				Array.from(data.screenshots).map((ss) =>
					uploadToCloudinary(ss, 'screenshot')
				)
			);

			if (!screenshotsRes.length) {
				// Clean up favicon if screenshots fail
				await deleteFromCloudinary(faviconRes.publicId);
				throw new Error('Screenshots upload failed!');
			}

			// Now all uploads succeeded
			const payload = {
				...data,
				favicon: faviconRes.url,
				screenshots: screenshotsRes.map((s) => s.url) as [string, string, string],
			};

			try {
				// TODO: Submit `payload` to backend
				console.log('Submitted Project:', payload);

				await createProject(payload);

				closeModalAction();
			} catch (error) {
				if (faviconRes?.publicId) {
					await deleteFromCloudinary(faviconRes.publicId);
				}

				if (screenshotsRes.length > 0 && screenshotsRes[0]?.publicId) {
					await Promise.allSettled(
						screenshotsRes.map((ss) => deleteFromCloudinary(ss.publicId))
					);
				}

				throw error;
			}
		} catch (err) {
			console.error(err);
			setError((err as Error)?.message || 'Something went wrong');
		}
	};

	return (
		<Form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
			<Input
				label="Title"
				placeholder="Project Title"
				errorMessage={errors.title?.message}
				isInvalid={!!errors.title}
				{...register('title')}
			/>

			<Textarea
				label="Description"
				placeholder="Project Description"
				errorMessage={errors.description?.message}
				isInvalid={!!errors.description}
				{...register('description')}
			/>

			<Input
				label="Live Link"
				placeholder="https://yourproject.com"
				errorMessage={errors.liveLink?.message}
				isInvalid={!!errors.liveLink}
				{...register('liveLink')}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label="GitHub Link 1"
					placeholder="https://github.com/user/repo"
					errorMessage={errors.github?.[0]?.message}
					isInvalid={!!errors.github?.[0]}
					{...register('github.0')}
				/>
				<Input
					label="GitHub Link 2 (Optional)"
					placeholder="https://github.com/user/repo2"
					errorMessage={errors.github?.[1]?.message}
					isInvalid={!!errors.github?.[1]}
					{...register('github.1')}
				/>
			</div>

			<Input
				label="Favicon"
				type="file"
				accept="image/gif, image/svg+xml, image/png,"
				errorMessage={errors.favicon?.message?.toString()}
				isInvalid={!!errors.favicon}
				{...register('favicon')}
			/>

			<Input
				label="Screenshots (3)"
				type="file"
				multiple
				accept="image/jpeg, image/jpg, image/png"
				errorMessage={errors.screenshots?.message?.toString()}
				isInvalid={!!errors.screenshots}
				{...register('screenshots')}
			/>

			{/* Display screenshot file names */}
			{watch('screenshots') && (
				<ul className="text-xs text-gray-600 mt-1">
					{Array.from(watch('screenshots') ?? []).map((file, i) => (
						<li key={i}>{file.name}</li>
					))}
				</ul>
			)}

			<Controller
				name="technologies"
				control={control}
				render={({ field, fieldState }) => (
					<CreatableMultiSelect
						label="Technologies"
						value={field.value}
						onChange={field.onChange}
						error={fieldState.error?.message}
						isInvalid={!!errors.technologies}
					/>
				)}
			/>

			<Controller
				name="features"
				control={control}
				render={({ field, fieldState }) => (
					<CreatableMultiSelect
						label="Features"
						value={field.value}
						onChange={field.onChange}
						error={fieldState.error?.message}
						isInvalid={!!errors.features}
					/>
				)}
			/>

			<Controller
				name="lastUpdated"
				control={control}
				render={({ field, fieldState }) => (
					<DatePicker
						isRequired
						label="Last Updated"
						maxValue={today('UTC')} // disables future dates
						value={field.value ? parseDate(field.value) : null} // string → DateValue
						onChange={
							(date) => field.onChange(date?.toString() ?? '') // DateValue → string
						}
						errorMessage={fieldState.error?.message}
						isInvalid={!!fieldState.error}
					/>
				)}
			/>
			{/* <Input
				label="Last Updated"
				type="date"
				errorMessage={errors.lastUpdated?.message}
				isInvalid={!!errors.lastUpdated}
				{...register('lastUpdated')}
			/> */}

			{error && <p className="text-sm text-red-500 text-center mt-2">{error}</p>}

			<Button
				type="submit"
				className="w-full bg-primary hover:bg-primary-dark"
				isLoading={isSubmitting}
			>
				Create Project
			</Button>
		</Form>
	);
}
