'use client';

import { Button, Form, Input, Textarea } from '@heroui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { TProjectFields } from '../../types/project.types';
import { ProjectCreationFields } from '../../schema/project.schema';

interface Props {
	closeModal: () => void;
}

/**
 * Project Creation/Update Form Component
 */
export default function ProjectForm({ closeModal }: Props) {
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<TProjectFields>({
		resolver: zodResolver(ProjectCreationFields),
	});

	const onSubmit = async (data: TProjectFields) => {
		try {
			setError(null);

			// TODO: Add image uploads + form submission logic
			console.log('Submitted Project:', data);

			closeModal();
		} catch (err) {
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
				accept="image/*"
				errorMessage={errors.favicon?.message?.toString()}
				isInvalid={!!errors.favicon}
				{...register('favicon')}
			/>

			<Input
				label="Screenshots (3)"
				type="file"
				multiple
				accept="image/*"
				errorMessage={errors.screenshots?.message?.toString()}
				isInvalid={!!errors.screenshots}
				{...register('screenshots')}
			/>

			<Textarea
				label="Technologies (comma separated)"
				placeholder="React, Node.js, Tailwind"
				errorMessage={errors.technologies?.message}
				isInvalid={!!errors.technologies}
				{...register('technologies')}
			/>

			<Textarea
				label="Features (comma separated)"
				placeholder="Authentication, Realtime Chat, Offline Support"
				errorMessage={errors.features?.message}
				isInvalid={!!errors.features}
				{...register('features')}
			/>

			<Input
				label="Last Updated"
				type="date"
				errorMessage={errors.lastUpdated?.message}
				isInvalid={!!errors.lastUpdated}
				{...register('lastUpdated')}
			/>

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
