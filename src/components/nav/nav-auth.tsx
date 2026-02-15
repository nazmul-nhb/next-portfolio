import { LogIn, LogOut, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import type { Maybe } from 'nhb-toolbox/types';
import SmartTooltip from '@/components/smart-tooltip';
import { Button } from '@/components/ui/button';
import { buildCloudinaryUrl } from '@/lib/utils';

type Props = {
    pathname: string;
    isAdmin: boolean;
    user: Maybe<Session['user']>;
    status: 'loading' | 'authenticated' | 'unauthenticated';
};

export default function NavbarAuth({ user, isAdmin, pathname, status }: Props) {
    return (
        <>
            {status === 'loading' ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : user ? (
                <div className="flex items-center gap-1">
                    {isAdmin && (
                        <Link
                            className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors sm:flex ${
                                pathname.startsWith('/admin')
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent'
                            }`}
                            href={'/admin'}
                        >
                            <SmartTooltip
                                content="Admin Dashboard"
                                trigger={<Settings className="h-3.5 w-3.5" />}
                            />
                            <span>Admin</span>
                        </Link>
                    )}
                    <Link
                        className="flex items-center rounded-full p-0.5 transition-all hover:ring-2 hover:ring-primary/30"
                        href="/settings"
                    >
                        <SmartTooltip
                            content={user.name || 'Profile'}
                            trigger={
                                user.image ? (
                                    <Image
                                        alt={user.name || 'User'}
                                        className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
                                        height={32}
                                        src={buildCloudinaryUrl(user.image)}
                                        width={32}
                                    />
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-violet-500 text-xs font-bold text-white">
                                        {(user.name || 'User').charAt(0).toUpperCase()}
                                    </div>
                                )
                            }
                        />
                    </Link>

                    <SmartTooltip
                        content="Sign out"
                        trigger={
                            <Button
                                className="h-8 w-8 rounded-full text-muted-foreground"
                                onClick={() => signOut({ callbackUrl: '/' })}
                                size="icon"
                                variant="ghost"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        }
                    />
                </div>
            ) : (
                <Button asChild className="rounded-full" size="sm" variant="default">
                    <Link href="/auth/login">
                        <LogIn className="mr-1.5 h-3.5 w-3.5" />
                        Sign In
                    </Link>
                </Button>
            )}
        </>
    );
}
