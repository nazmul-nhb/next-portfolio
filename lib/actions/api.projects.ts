import type { TProject, TProjectData } from '@/types/project.types';

import { revalidateTag } from 'next/cache';

import { httpRequest } from './baseRequest';

/** Fetch all projects from server. */
export async function fetchProjects() {
	try {
		const res = await httpRequest<TProject[]>('/api/projects', {
			cache: 'force-cache',
			next: {
				tags: ['projects'],
			},
		});

		return res?.data || [];
	} catch (error) {
		console.error(error);
	}
}

/**
 * Create a new project data to store in DB.
 * @param data Project data to post
 */
export async function createProject(data: TProjectData) {
	try {
		const res = await httpRequest<TProject, TProjectData>('api/projects', {
			method: 'POST',
			body: data,
			next: {
				revalidate: 0,
				tags: ['projects'],
			},
		});

		revalidateTag('projects');

		return res.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
}
