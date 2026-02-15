'use client';

import { Chrome, Lock, Mail, User, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { FadeInUp } from '@/components/misc/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { httpRequest } from '@/lib/actions/baseRequest';

/**
 * Registration page for new users.
 */
export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await httpRequest('/api/auth/register', {
                method: 'POST',
                body: { name, email, password },
            });

            // Auto-login after registration
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.ok) {
                router.push('/settings');
                router.refresh();
            }
        } catch (err) {
            const message =
                typeof err === 'object' && err !== null && 'message' in err
                    ? String((err as { message: string }).message)
                    : 'Registration failed';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl: '/' });
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <FadeInUp>
                <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-8 shadow-sm">
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-2xl font-bold">Create Account</h1>
                        <p className="text-sm text-muted-foreground">
                            Join the community and start writing!
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

                    <form className="space-y-4" onSubmit={handleRegister}>
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative mt-1.5">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-10"
                                    id="name"
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nazmul Hassan"
                                    required
                                    value={name}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <div className="relative mt-1.5">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
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

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <div className="relative mt-1.5">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-10"
                                    id="password"
                                    minLength={6}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    required
                                    type="password"
                                    value={password}
                                />
                            </div>
                        </div>

                        {error && <p className="text-sm text-destructive">{error}</p>}

                        <Button
                            className="w-full"
                            disabled={loading}
                            loading={loading}
                            type="submit"
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            {'Create Account'}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link className="text-primary hover:underline" href="/auth/login">
                            Sign in
                        </Link>
                    </p>
                </div>
            </FadeInUp>
        </div>
    );
}
