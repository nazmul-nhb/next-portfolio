'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useUserStore } from '@/lib/store/user-store';

/**
 * Syncs NextAuth session with Zustand user store
 * Add this component to your root layout
 */
export function AuthSync() {
    const { data: session, status } = useSession();
    const { syncFromSession, clearProfile } = useUserStore();

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'authenticated' && session) {
            syncFromSession(session);
        } else {
            clearProfile();
        }
    }, [session, status, syncFromSession, clearProfile]);

    return null;
}
