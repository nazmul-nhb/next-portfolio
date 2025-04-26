import type { DBItem } from '@/types';

import { create } from 'zustand';

import { getCurrentUser } from '../actions/manageUser';

export interface User extends DBItem {
	email: string;
	role: 'admin' | 'visitor';
}

interface AuthState {
	user?: User | null;
	isLoading: boolean;

	login: (user?: User) => void;
	logout: () => void;
	syncUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	isLoading: true,
	login: (user) => set({ user }),
	logout: () => set({ user: null }),
	syncUser: async () => {
		try {
			const user = await getCurrentUser();

			if (user) {
				set({ user });
			} else {
				set({ user: null });
			}
		} catch (error) {
			set({ user: null });
			console.error(error);
		} finally {
			set({ isLoading: false });
		}
	},
}));
