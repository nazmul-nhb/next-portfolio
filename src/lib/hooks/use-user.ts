import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { type UserProfile, useUserStore } from '@/lib/store/user-store';

interface UpdateProfileData {
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
    const updateProfile = useUserStore((state) => state.updateProfile);

    return useApiMutation<UserProfile, UpdateProfileData>('/api/users/me', 'PATCH', {
        successMessage: 'Profile updated successfully',
        invalidateKeys: 'user-profile',
        onSuccess: (data) => {
            // Sync with Zustand store immediately
            updateProfile({
                name: data.name,
                bio: data.bio,
                profile_image: data.profile_image,
            });
        },
    });
}

/**
 * Upload profile image
 */
export function useUploadProfileImage() {
    const updateProfile = useUserStore((state) => state.updateProfile);

    return useApiMutation<{ url: string }, FormData>('/api/uploads/profile', 'POST', {
        successMessage: 'Image uploaded successfully',
        onSuccess: (data) => {
            updateProfile({ profile_image: data.url });
        },
    });
}
