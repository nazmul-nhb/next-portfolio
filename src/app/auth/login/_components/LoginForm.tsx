'use client';

import { Chrome, Lock, LogIn, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { FadeInUp } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Login form component with search params handling.
 */
export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = (searchParams.get('callbackUrl') || '/') as '/';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError('Invalid email or password');
            setLoading(false);
        } else {
            router.push(callbackUrl);
            router.refresh();
        }
    };

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl });
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <FadeInUp>
                <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-8 shadow-sm">
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-2xl font-bold">Welcome Back</h1>
                        <p className="text-sm text-muted-foreground">
                            Sign in to your account to continue
                        </p>
                    </div>

                    <Button
                        className="mb-6 w-full gap-2"
                        onClick={handleGoogleLogin}
                        variant="outline"
                    >
                        <Chrome className="h-4 w-4" />
                        Continue with Google
                    </Button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-card px-3 text-xs text-muted-foreground">
                                OR
                            </span>
                        </div>
                    </div>

                    <form className="space-y-4" onSubmit={handleCredentialsLogin}>
                        {error && (
                            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    autoComplete="email"
                                    className="pl-10"
                                    id="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    type="email"
                                    value={email}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    autoComplete="current-password"
                                    className="pl-10"
                                    id="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    type="password"
                                    value={password}
                                />
                            </div>
                        </div>

                        <Button className="w-full gap-2" disabled={loading} type="submit">
                            <LogIn className="h-4 w-4" />
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link className="text-primary hover:underline" href="/auth/register">
                            Create one
                        </Link>
                    </p>
                </div>
            </FadeInUp>
        </div>
    );
}
