'use server';

import type { User } from '../store/authStore';

import { cookies } from 'next/headers';

import { verifyJwt } from '@/lib/jwt';

/**
 * Get the currently logged in user from cookie
 */
export async function getCurrentUser(): Promise<User | null> {
	const cookieStore = await cookies();

	const token = cookieStore.get('token')?.value;

	if (!token) {
		return null;
	}

	try {
		const user = verifyJwt(token);

		return user as User;
	} catch {
		return null;
	}
}

export async function logoutUser() {
	const cookieStore = await cookies();

	cookieStore.delete('token');
}
