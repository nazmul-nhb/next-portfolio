import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { RegisterForm } from '@/app/auth/register/_components/RegisterForm';
import Loading from '@/components/misc/loading';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
    title: 'Register',
    description: 'Register a new account to access personalized features.',
};

export default async function RegisterPage() {
    const session = await auth();

    if (session) redirect('/');

    return (
        <Suspense fallback={<Loading />}>
            <RegisterForm />
        </Suspense>
    );
}
