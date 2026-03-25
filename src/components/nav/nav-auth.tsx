'use client';

import { LogIn, LogOut, PenTool, Settings } from 'lucide-react';
import Link from 'next/link';
import type { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import type { Maybe } from 'nhb-toolbox/types';
import { useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import SmartTooltip from '@/components/misc/smart-tooltip';
import UserAvatar from '@/components/misc/user-avatar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUserStore } from '@/lib/store/user-store';
import { isAdminPath } from '@/lib/utils';

type Props = {
    pathname: string;
    isAdmin: boolean;
    user: Maybe<Session['user']>;
    status: 'loading' | 'authenticated' | 'unauthenticated';
};

export default function NavbarAuth({ user, isAdmin, pathname, status }: Props) {
    // Use Zustand store for profile image (updates immediately)
    const { profile, clearProfile } = useUserStore();
    const [open, setOpen] = useState(false);

    // Prefer Zustand profile over session for profile image (for real-time updates)
    const displayName = profile?.name || user?.name;
    const displayImage = profile?.profile_image || user?.image;

    const handleLogout = async () => {
        clearProfile();
        await signOut();
        setOpen(false);
    };

    return (
        <Fragment>
            {status === 'loading' ? (
                <div className="size-8 animate-pulse rounded-full bg-muted" />
            ) : user ? (
                <div className="flex items-center gap-1">
                    {isAdmin && (
                        <Link
                            className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors sm:flex ${
                                isAdminPath(pathname)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent'
                            }`}
                            href={'/admin'}
                        >
                            <SmartTooltip
                                content="Admin Dashboard"
                                trigger={<Settings className="size-3.5" />}
                            />
                            <span>Admin</span>
                        </Link>
                    )}
                    <Popover onOpenChange={setOpen} open={open}>
                        <PopoverTrigger asChild>
                            <button
                                className="flex items-center rounded-full p-0.5 transition-all hover:ring-2 hover:ring-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                type="button"
                            >
                                <UserAvatar image={displayImage} name={displayName} size="sm" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-56 p-2" sideOffset={8}>
                            <div className="flex flex-col gap-1">
                                <Link
                                    className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                                    href={`/users/${user.id}`}
                                    onClick={() => setOpen(false)}
                                >
                                    <p className="font-medium">{displayName || 'User'}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {user.email}
                                    </p>
                                </Link>
                                <div className="h-px bg-border" />
                                <Link href="/blogs/my" onClick={() => setOpen(false)}>
                                    <Button
                                        className={`w-full justify-start gap-2 text-sm font-normal ${pathname === ('/blogs/my') ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'}`}
                                        variant="ghost"
                                    >
                                        <PenTool className="size-4" />
                                        My Blogs
                                    </Button>
                                </Link>
                                <Link href="/settings" onClick={() => setOpen(false)}>
                                    <Button
                                        className={`w-full justify-start gap-2 text-sm font-normal ${pathname === '/settings' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'}`}
                                        variant="ghost"
                                    >
                                        <Settings className="size-4" />
                                        Settings
                                    </Button>
                                </Link>
                                <Button
                                    className="w-full justify-start gap-2 text-sm font-normal text-destructive hover:text-destructive"
                                    onClick={handleLogout}
                                    variant="ghost"
                                >
                                    <LogOut className="size-4" />
                                    Sign Out
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            ) : (
                <Button asChild className="rounded-full" size="sm" variant="default">
                    <Link href={`/auth/login?redirectTo=${pathname}`}>
                        <LogIn className="mr-1.5 size-3.5" />
                        Sign In
                    </Link>
                </Button>
            )}
        </Fragment>
    );
}
