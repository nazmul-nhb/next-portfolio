'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/lib/store/authStore';

/**
 * Syncs the current authenticated user into the global store on app load.
 */
export default function SyncCurrentUser() {
	const { syncUser } = useAuthStore();

	useEffect(() => {
		syncUser();
	}, [syncUser]);

	return null; // invisible
}
