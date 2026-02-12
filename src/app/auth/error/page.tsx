import { AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FadeInUp } from '@/components/animations';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Authentication Error',
    description: 'An error occurred during authentication.',
};

/** Auth error page for failed sign-in attempts. */
export default function AuthErrorPage() {
    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4">
            <FadeInUp>
                <div className="max-w-md text-center">
                    <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
                    <h1 className="mb-2 text-2xl font-bold">Authentication Error</h1>
                    <p className="mb-6 text-muted-foreground">
                        Something went wrong during sign in. Please try again or use a different
                        method.
                    </p>
                    <div className="flex justify-center gap-3">
                        <Button asChild>
                            <Link href="/auth/login">Try Again</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/">Go Home</Link>
                        </Button>
                    </div>
                </div>
            </FadeInUp>
        </div>
    );
}
