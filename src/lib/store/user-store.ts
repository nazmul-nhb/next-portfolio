import type { Session } from 'next-auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    bio: string | null;
    profile_image: string | null;
    role: 'admin' | 'user';
    email_verified: boolean;
    provider: 'credentials' | 'google';
}

interface UserState {
    profile: UserProfile | null;
    isInitialized: boolean;

    // Actions
    setProfile: (profile: UserProfile | null) => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    syncFromSession: (session: Session | null) => void;
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

            syncFromSession: (session) => {
                if (session?.user) {
                    const profile: UserProfile = {
                        id: Number(session.user.id),
                        name: session.user.name,
                        email: session.user.email,
                        bio: null, // Will be loaded from API
                        profile_image: session.user.image || null,
                        role: session.user.role,
                        email_verified: session.user.email_verified,
                        provider: session.user.provider,
                    };
                    set({ profile, isInitialized: true });
                } else {
                    set({ profile: null, isInitialized: true });
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
