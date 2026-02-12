import { Suspense } from 'react';
import { LoginForm } from './_components/LoginForm';

/**
 * Login page with credentials and Google authentication.
 */
export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[80vh] items-center justify-center">
                    <div className="text-muted-foreground">Loading...</div>
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
