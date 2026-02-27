import { Suspense } from 'react';
import Loading from '@/components/loading';
import { LoginForm } from './_components/LoginForm';

/**
 * Login page with credentials and Google authentication.
 */
export default function LoginPage() {
    return (
        <Suspense fallback={<Loading />}>
            <LoginForm />
        </Suspense>
    );
}
