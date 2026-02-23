'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { FadeInUp } from '@/components/misc/animations';

/**
 * Safety-net page for deactivated / deleted accounts.
 * The proxy redirects here when `session.user.active === false`.
 * Calls signOut() immediately so the stale JWT is cleared.
 */
export default function ForceSignOutPage() {
    useEffect(() => {
        signOut({ redirectTo: '/auth/login?reason=account-deactivated' });
    }, []);

    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4">
            <FadeInUp>
                <div className="max-w-md text-center">
                    <h1 className="mb-2 text-2xl font-bold">Session Ended</h1>
                    <p className="text-muted-foreground">
                        Your account has been deactivated or removed. Signing you out…
                    </p>
                </div>
            </FadeInUp>
        </div>
    );
}
