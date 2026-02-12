'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LogIn, LogOut, Menu, Search, Settings, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { TabItem } from '@/components/ui/doc-tabs';
import { siteConfig } from '@/configs/site';

/** Main navigation bar with animated tabs, search, and responsive drawer. */
export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const isAdmin = session?.user?.role === 'admin';

    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close mobile menu on route change
    useEffect(() => {
        if (pathname) {
            setMobileOpen(false);
            setSearchOpen(false);
        }
    }, [pathname]);

    // Focus search input when opened
    useEffect(() => {
        if (searchOpen) searchInputRef.current?.focus();
    }, [searchOpen]);

    // Close on Escape key / Ctrl+K to open search
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setMobileOpen(false);
                setSearchOpen(false);
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (searchQuery.trim()) {
                router.push(`/blogs?search=${encodeURIComponent(searchQuery.trim())}`);
                setSearchOpen(false);
                setSearchQuery('');
            }
        },
        [searchQuery, router]
    );

    // Split nav items at the separator
    const primaryNav: Extract<TabItem, { path: string }>[] = [];
    const secondaryNav: Extract<TabItem, { path: string }>[] = [];
    let pastSeparator = false;
    for (const item of siteConfig.navItems) {
        if (item.type === 'separator') {
            pastSeparator = true;
            continue;
        }
        if (pastSeparator) secondaryNav.push(item);
        else primaryNav.push(item);
    }

    /** Check if a path is currently active. */
    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    };

    return (
        <>
            <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                    {/* Left: Logo + Site Name */}
                    <Link
                        className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
                        href="/"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-violet-600 text-sm font-bold text-white shadow-md">
                            NH
                        </div>
                        <span className="hidden text-lg font-semibold tracking-tight sm:inline">
                            {siteConfig.name}
                        </span>
                    </Link>

                    {/* Center: Desktop Nav (doc-style tabs) */}
                    <div className="hidden items-center gap-0.5 rounded-full border border-border/50 bg-muted/30 p-1 backdrop-blur-sm md:flex">
                        {primaryNav.map((tab) => {
                            const Icon = tab.icon;
                            const active = isActive(tab.path);
                            return (
                                <Link
                                    className={`relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                                        active
                                            ? 'text-foreground'
                                            : 'text-muted-foreground hover:text-foreground/80'
                                    }`}
                                    href={tab.path as '/'}
                                    key={tab.path}
                                >
                                    {active && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full bg-background shadow-sm border border-border/60"
                                            layoutId="navbar-pill"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 400,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        <Icon className="h-4 w-4" />
                                        <AnimatePresence mode="wait">
                                            {active && (
                                                <motion.span
                                                    animate={{
                                                        width: 'auto',
                                                        opacity: 1,
                                                    }}
                                                    className="overflow-hidden whitespace-nowrap"
                                                    exit={{ width: 0, opacity: 0 }}
                                                    initial={{ width: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {tab.title}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right: Search + Profile + Actions */}
                    <div className="flex items-center gap-1.5">
                        {/* Search Button */}
                        <Button
                            className="h-9 w-9 rounded-full"
                            onClick={() => setSearchOpen(true)}
                            size="icon"
                            title="Search (Ctrl+K)"
                            variant="ghost"
                        >
                            <Search className="h-4 w-4" />
                        </Button>

                        {/* Secondary nav items (desktop only) */}
                        <div className="hidden items-center gap-0.5 md:flex">
                            {secondaryNav.map((tab) => {
                                const Icon = tab.icon;
                                const active = isActive(tab.path);
                                return (
                                    <Link
                                        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                                            active
                                                ? 'bg-accent text-accent-foreground'
                                                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                                        }`}
                                        href={tab.path as '/'}
                                        key={tab.path}
                                        title={tab.title}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Separator */}
                        <div className="mx-1 hidden h-6 w-px bg-border md:block" />

                        {/* Auth Section */}
                        {status === 'loading' ? (
                            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                        ) : session?.user ? (
                            <div className="flex items-center gap-1">
                                {isAdmin && (
                                    <Link
                                        className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors sm:flex ${
                                            pathname.startsWith('/admin')
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-accent'
                                        }`}
                                        href={'/admin' as '/'}
                                        title="Admin Dashboard"
                                    >
                                        <Settings className="h-3.5 w-3.5" />
                                        <span>Admin</span>
                                    </Link>
                                )}
                                <Link
                                    className="flex items-center rounded-full p-0.5 transition-all hover:ring-2 hover:ring-primary/30"
                                    href="/settings"
                                    title={session.user.name || 'Profile'}
                                >
                                    {session.user.image ? (
                                        <Image
                                            alt={session.user.name || 'User'}
                                            className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
                                            height={32}
                                            src={session.user.image}
                                            width={32}
                                        />
                                    ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-violet-500 text-xs font-bold text-white">
                                            {(session.user.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </Link>
                                <Button
                                    className="h-8 w-8 rounded-full text-muted-foreground"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    size="icon"
                                    title="Sign out"
                                    variant="ghost"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                asChild
                                className="rounded-full"
                                size="sm"
                                variant="default"
                            >
                                <Link href="/auth/login">
                                    <LogIn className="mr-1.5 h-3.5 w-3.5" />
                                    Sign In
                                </Link>
                            </Button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <Button
                            className="h-9 w-9 rounded-full md:hidden"
                            onClick={() => setMobileOpen(true)}
                            size="icon"
                            variant="ghost"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Search Overlay */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-60 flex items-start justify-center bg-background/80 pt-20 backdrop-blur-sm"
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        onClick={() => setSearchOpen(false)}
                    >
                        <motion.div
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            className="mx-4 w-full max-w-lg rounded-xl border border-border bg-background p-4 shadow-2xl"
                            exit={{ y: -10, opacity: 0, scale: 0.98 }}
                            initial={{ y: -20, opacity: 0, scale: 0.98 }}
                            onClick={(e) => e.stopPropagation()}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        >
                            <form className="flex items-center gap-3" onSubmit={handleSearch}>
                                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                                <input
                                    className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search blogs, projects..."
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                />
                                <kbd className="hidden rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline">
                                    ESC
                                </kbd>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileOpen && (
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
                                            href={'/admin' as '/'}
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
                                {session?.user ? (
                                    <div className="flex items-center gap-3">
                                        {session.user.image ? (
                                            <Image
                                                alt={session.user.name || 'User'}
                                                className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
                                                height={40}
                                                src={session.user.image}
                                                width={40}
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-violet-500 font-bold text-white">
                                                {(session.user.name || 'U')
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {session.user.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {session.user.email}
                                            </p>
                                        </div>
                                        <Button
                                            className="h-8 w-8 shrink-0 rounded-full"
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            size="icon"
                                            title="Sign Out"
                                            variant="ghost"
                                        >
                                            <LogOut className="h-4 w-4" />
                                        </Button>
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
                )}
            </AnimatePresence>
        </>
    );
}
