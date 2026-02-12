'use client';

import { LogIn, LogOut, Settings, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import DocTabs from '@/components/ui/doc-tabs';
import { siteConfig } from '@/configs/site';

/** Main navigation bar with animated tabs and auth state. */
export default function Navbar() {
    const { data: session, status } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-center gap-3 py-2">
            <DocTabs tabs={siteConfig.navItems} />
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 p-1 shadow-md backdrop-blur-sm dark:border-slate-700 dark:bg-black">
                {status === 'loading' ? (
                    <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                ) : session?.user ? (
                    <div className="flex items-center gap-1">
                        {isAdmin && (
                            <Link
                                className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-colors hover:bg-muted"
                                href={'/admin' as '/'}
                                title="Admin Dashboard"
                            >
                                <Settings className="h-4 w-4" />
                                <span className="hidden sm:inline">Admin</span>
                            </Link>
                        )}
                        <Link
                            className="flex items-center gap-2 rounded-full px-2 py-1 text-sm transition-colors hover:bg-muted"
                            href="/settings"
                        >
                            {session.user.image ? (
                                <Image
                                    alt={session.user.name || 'User'}
                                    className="h-7 w-7 rounded-full object-cover"
                                    height={28}
                                    src={session.user.image}
                                    width={28}
                                />
                            ) : (
                                <User className="h-7 w-7 rounded-full bg-muted p-1" />
                            )}
                        </Link>
                        <Button
                            className="h-8 w-8 rounded-full"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            size="icon"
                            title="Sign out"
                            variant="ghost"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <Link
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                        href="/auth/login"
                    >
                        <LogIn className="h-4 w-4" />
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
}
