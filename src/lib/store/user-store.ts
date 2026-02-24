import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/types';

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    bio: string | null;
    profile_image: string | null;
    role: UserRole;
    email_verified: boolean;
    provider: 'credentials' | 'google';
}

interface UserState {
    profile: UserProfile | null;
    isInitialized: boolean;

    // Actions
    setProfile: (profile: UserProfile | null) => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    clearProfile: () => void;
}

/**
 * Global user state store using Zustand
 * Syncs with NextAuth session and provides real-time profile updates
 */
export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            profile: null,
            isInitialized: false,

            setProfile: (profile) => {
                set({ profile, isInitialized: true });
            },

            updateProfile: (updates) => {
                const currentProfile = get().profile;
                if (currentProfile) {
                    set({
                        profile: { ...currentProfile, ...updates },
                    });
                }
            },

            clearProfile: () => {
                set({ profile: null, isInitialized: false });
            },
        }),
        {
            name: 'user-storage',
            partialize: (state) => ({
                profile: state.profile,
                // Don't persist isInitialized to force session sync on reload
            }),
        }
    )
);
