import { motion } from 'framer-motion';
import { LogIn, LogOut, Settings, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import type { Maybe } from 'nhb-toolbox/types';
import type { Dispatch, SetStateAction } from 'react';
import SmartTooltip from '@/components/smart-tooltip';
import { Button } from '@/components/ui/button';
import { buildCloudinaryUrl } from '@/lib/utils';
import type { TabItem } from '@/types';

type Props = {
    isAdmin: boolean;
    isActive: (path: string) => boolean;
    pathname: string;
    primaryNav: Extract<TabItem, { path: string }>[];
    secondaryNav: Extract<TabItem, { path: string }>[];
    user: Maybe<Session['user']>;
    setMobileOpen: Dispatch<SetStateAction<boolean>>;
};

export default function NavMobileDrawer({
    isAdmin,
    isActive,
    pathname,
    primaryNav,
    secondaryNav,
    setMobileOpen,
    user,
}: Props) {
    return (
        <>
            {/* Backdrop */}
            <motion.div
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-60 bg-background/60 backdrop-blur-sm md:hidden"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
                animate={{ x: 0 }}
                className="fixed inset-y-0 right-0 z-70 flex w-72 flex-col border-l border-border bg-background shadow-2xl md:hidden"
                exit={{ x: '100%' }}
                initial={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            >
                <div className="flex items-center justify-between border-b border-border p-4">
                    <span className="text-sm font-semibold">Navigation</span>
                    <Button
                        className="h-8 w-8 rounded-full"
                        onClick={() => setMobileOpen(false)}
                        size="icon"
                        variant="ghost"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <nav className="flex-1 overflow-y-auto p-3">
                    <div className="space-y-0.5">
                        {primaryNav.map((tab) => {
                            const Icon = tab.icon;
                            const active = isActive(tab.path);
                            return (
                                <Link
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                        active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                    }`}
                                    href={tab.path as '/'}
                                    key={tab.path}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.title}
                                </Link>
                            );
                        })}
                    </div>

                    {secondaryNav.length > 0 && (
                        <>
                            <div className="my-3 h-px bg-border" />
                            <div className="space-y-0.5">
                                {secondaryNav.map((tab) => {
                                    const Icon = tab.icon;
                                    const active = isActive(tab.path);
                                    return (
                                        <Link
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                                active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                            }`}
                                            href={tab.path as '/'}
                                            key={tab.path}
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {tab.title}
                                        </Link>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {isAdmin && (
                        <>
                            <div className="my-3 h-px bg-border" />
                            <Link
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                    pathname.startsWith('/admin')
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`}
                                href={'/admin'}
                                onClick={() => setMobileOpen(false)}
                            >
                                <Settings className="h-4 w-4" />
                                Admin Dashboard
                            </Link>
                        </>
                    )}
                </nav>

                {/* User section at bottom */}
                <div className="border-t border-border p-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            {user.image ? (
                                <Image
                                    alt={user?.name || 'User'}
                                    className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
                                    height={40}
                                    src={buildCloudinaryUrl(user.image)}
                                    width={40}
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-violet-500 font-bold text-white">
                                    {(user.name || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{user.name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                            <SmartTooltip
                                content="Sign out"
                                trigger={
                                    <Button
                                        className="h-8 w-8 shrink-0 rounded-full"
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
                        <Button asChild className="w-full" size="sm">
                            <Link href="/auth/login">
                                <LogIn className="mr-2 h-4 w-4" />
                                Sign In
                            </Link>
                        </Button>
                    )}
                </div>
            </motion.aside>
        </>
    );
}
