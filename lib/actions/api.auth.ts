import type { TCredentials, TRegisterUser, TUser } from '@/types/user.types';

import { httpRequest } from '@/lib/actions/baseRequest';

export async function loginUser(credentials: TCredentials) {
	try {
		const res = await httpRequest<TUser, TCredentials>('/api/auth/login', {
			method: 'POST',
			body: credentials,
			credentials: 'include',
		});

		return res.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function registerUser(userData: TRegisterUser) {
	try {
		const res = await httpRequest<void, TRegisterUser>('/api/auth/register', {
			method: 'POST',
			body: userData,
		});

		return res;
	} catch (error) {
		console.error(error);
		throw error;
	}
}
