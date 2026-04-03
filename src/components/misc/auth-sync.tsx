'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { httpRequest } from '@/lib/actions/baseRequest';
import { type UserProfile, useUserStore } from '@/lib/store/user-store';

/**
 * Single source of truth: syncs the Zustand store from /api/users/me (DB), never from stale JWT claims.
 *
 * - Fetches fresh profile from the DB whenever the session is authenticated.
 * - staleTime: 0 ensures react-query re-validates on every window focus /
 *   route change, keeping the store current without manual polling.
 * - On 401 / 403 / 404 (deleted or deactivated account) it immediately
 *   clears the store and calls signOut(), complementing the proxy-level check.
 */
export function AuthSync() {
    const { status } = useSession();
    const { setProfile, clearProfile } = useUserStore();
    const pathname = usePathname();

    const isAuthenticated = status === 'authenticated';

    const { data, isError, error } = useQuery({
        // Share the cache key with useUserProfile() so both always see fresh data
        queryKey: ['user-profile'],
        queryFn: async () => {
            const res = await httpRequest<UserProfile>('/api/users/me');
            return res.data;
        },
        enabled: isAuthenticated,
        staleTime: 500, // Consider data fresh for 0.5s to avoid redundant fetches on rapid route changes
        retry: false, // Auth failures (401/403/404) are definitive — don't retry
    });

    // Sync fresh DB data into the store
    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            clearProfile();
            return;
        }

        if (isAuthenticated && data) {
            setProfile(data);
        }
    }, [status, isAuthenticated, data, setProfile, clearProfile]);

    // Force sign-out if account is deleted or deactivated
    // Only trigger this when actually authenticated to avoid race conditions
    useEffect(() => {
        // Guard: only handle auth errors when the user is authenticated
        if (!isAuthenticated) return;
        if (!isError) return;

        const statusCode = (error as { status?: number })?.status;
        if (statusCode === 401 || statusCode === 403 || statusCode === 404) {
            clearProfile();
            signOut({
                redirectTo: `/auth/login?redirectTo=${pathname}&reason=account-deactivated`,
            });
        }
    }, [isError, error, clearProfile, pathname, isAuthenticated]);

    return null;
}
