import { create } from 'zustand';

import { getCurrentUser } from '../api.auth';

interface User {
	id: string;
	email: string;
	role: 'admin' | 'visitor';
}

interface AuthState {
	user: User | null;
	login: (user: User) => void;
	logout: () => void;
	syncUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	login: (user) => set({ user }),
	logout: () => set({ user: null }),
	syncUser: async () => {
		const user = await getCurrentUser();

		if (user) {
			set({ user });
		} else {
			set({ user: null });
		}
	},
}));
