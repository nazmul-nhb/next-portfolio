import {
    getFromLocalStorage,
    parseJSON,
    removeFromLocalStorage,
    saveToLocalStorage,
} from 'nhb-toolbox';
import { Cipher } from 'nhb-toolbox/hash';
import { create } from 'zustand';
import { persist, type StorageValue } from 'zustand/middleware';
import { ENV } from '@/configs/env';
import type { UserRole } from '@/types';

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    bio: string | null;
    profile_image: string | null;
    role: UserRole;
    preferred_currency?: string;
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

type StoredValue = StorageValue<{ profile: UserProfile | null }>;

const cipher = new Cipher(ENV.cipherSecret);

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
            partialize: ({ profile }) => ({ profile }),
            storage: {
                setItem(name, value) {
                    saveToLocalStorage(name, value, (state) => {
                        const stringified = JSON.stringify(state);
                        return cipher.encrypt(stringified);
                    });
                },

                getItem(name) {
                    return getFromLocalStorage<StoredValue>(name, (stored) => {
                        const decrypted = cipher.decrypt(stored);
                        return parseJSON<StoredValue>(decrypted, false);
                    });
                },

                removeItem(name) {
                    removeFromLocalStorage(name);
                },
            },
        }
    )
);
