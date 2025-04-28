import type { TCredentials, IUser } from '@/types/user.types';

import { create } from 'zustand';

import { loginUser } from '../actions/api.auth';
import { getCurrentUser, logoutUser } from '../actions/manageUser';

interface AuthState {
	user?: IUser | null;
	isLoading: boolean;
	login: (credentials: TCredentials) => Promise<void>;
	logout: () => Promise<void>;
	syncUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	isLoading: true,
	login: async (credentials: TCredentials) => {
		try {
			set({ isLoading: true });

			const user = await loginUser(credentials);

			if (user) {
				set({ user });
			} else {
				set({ user: null });
			}
		} catch (error) {
			set({ user: null });
			console.error(error);
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},
	logout: async () => {
		try {
			set({ isLoading: true });
			await logoutUser();
			set({ user: null });
		} catch (error) {
			console.error(error);
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},
	syncUser: async () => {
		try {
			set({ isLoading: true });

			const user = await getCurrentUser();

			if (user) {
				set({ user });
			} else {
				set({ user: null });
			}
		} catch (error) {
			set({ user: null });
			console.error(error);
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},
}));
