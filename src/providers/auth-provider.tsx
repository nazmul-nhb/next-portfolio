'use client';

import { SessionProvider } from 'next-auth/react';
import type { ChildrenProp } from '@/types';

/**
 * Provides NextAuth session context to the application.
 * @param children - React child components.
 */
export function AuthProvider({ children }: ChildrenProp) {
    return <SessionProvider>{children}</SessionProvider>;
}
