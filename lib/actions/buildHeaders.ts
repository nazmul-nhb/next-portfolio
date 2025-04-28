'use server';

import { cookies } from 'next/headers';

/** * Builds headers with token from cookies if running on server */
export async function buildHeaders(headers?: HeadersInit) {
	const isServer = typeof window === 'undefined';

	if (!isServer) return headers || {};

	const cookieStore = await cookies();

	const token = cookieStore.get('token')?.value;

	if (token) {
		return {
			...(headers || {}),
			Authorization: `Bearer ${token}`,
		};
	}

	return headers || {};
}
