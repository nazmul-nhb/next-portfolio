'use server';

import type { IUser } from '@/types/user.types';

import { cookies } from 'next/headers';

import { httpRequest } from './baseRequest';

/** * Get the currently logged in user by decoding token from cookies */
export async function getCurrentUser() {
	try {
		const user = await httpRequest<IUser>(`/api/auth/me`);

		if (!user?.data) {
			return null;
		}

		return user.data;
	} catch {
		return null;
	}
}

export async function logoutUser() {
	const cookieStore = await cookies();

	cookieStore.delete('token');
}
