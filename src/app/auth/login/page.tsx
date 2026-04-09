import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Loading from '@/components/misc/loading';
import { auth } from '@/lib/auth';
import { LoginForm } from './_components/LoginForm';

export const metadata: Metadata = {
    title: 'Login',
    description: 'Login to your account to access personalized features.',
};

/**
 * Login page with credentials and Google authentication.
 */
export default async function LoginPage() {
    const session = await auth();

    if (session) redirect('/');

    return (
        <Suspense fallback={<Loading />} name="Login Page">
            <LoginForm />
        </Suspense>
    );
}
