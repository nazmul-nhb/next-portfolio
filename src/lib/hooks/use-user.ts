import { useSession } from 'next-auth/react';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { type UserProfile, useUserStore } from '@/lib/store/user-store';

export interface UpdateProfile {
    name?: string;
    bio?: string;
    profile_image?: string;
}

/**
 * Fetch current user profile
 */
export function useUserProfile() {
    return useApiQuery<UserProfile>('user-profile', '/api/users/me');
}

/**
 * Update user profile with automatic Zustand store sync
 */
export function useUpdateProfile() {
    const { updateProfile } = useUserStore();
    const { update: updateSession } = useSession();

    return useApiMutation<UserProfile, UpdateProfile>('/api/users/me', 'PATCH', {
        successMessage: 'Profile updated successfully',
        errorMessage: 'Failed to update profile',
        invalidateKeys: 'user-profile',
        onSuccess: (data) => {
            // Sync with Zustand store immediately
            updateProfile({
                name: data.name,
                bio: data.bio,
                profile_image: data.profile_image,
            });

            // Update NextAuth session to prevent stale data on reload
            updateSession({
                name: data.name,
                image: data.profile_image,
            });
        },
    });
}
