import type { User } from '../store/authStore';

import { httpRequest } from '@/lib/actions/baseRequest';

export async function loginUser(email: string, password: string) {
	try {
		const res = await httpRequest<User, { email: string; password: string }>(
			'/api/auth/login',
			{
				method: 'POST',
				body: { email, password },
				credentials: 'include',
			}
		);

		return res.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function registerUser(email: string, password: string) {
	try {
		const res = await httpRequest<void, { email: string; password: string }>(
			'/api/auth/register',
			{
				method: 'POST',
				body: { email, password },
			}
		);

		return res;
	} catch (error) {
		console.error(error);
		throw error;
	}
}
