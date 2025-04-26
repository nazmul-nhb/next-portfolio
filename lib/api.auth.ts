'use server';

import { cookies } from 'next/headers';

import { httpRequest } from '@/lib/baseRequest';

export async function loginUser(email: string, password: string) {
	try {
		const res = await httpRequest<
			{ id: string; email: string; role: string },
			{ email: string; password: string }
		>('/api/auth/login', {
			method: 'POST',
			body: { email, password },
		});

		return res.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function registerUser(email: string, password: string) {
	return httpRequest('/api/auth/register', {
		method: 'POST',
		body: { email, password },
	});
}

export async function getCurrentUser() {
	const res = await httpRequest(`/api/auth/me`, {
		method: 'GET',
		credentials: 'include',
		cache: 'no-store',
	});

	return res.data;
}

export async function logoutUser() {
	'use server';
	(await cookies()).delete('token');
}
