'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import NavbarAuth from '@/components/nav/nav-auth';
import NavbarDocked from '@/components/nav/nav-docked';
import NavMobileDrawer from '@/components/nav/nav-mobile';
import SmartTooltip from '@/components/smart-tooltip';
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
                        {/* <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-violet-600 text-sm font-bold text-white shadow-md">
                            NH
                        </div> */}
                        <Image
                            alt={siteConfig.name}
                            className="h-8 w-8 rounded-full object-fit"
                            height={520}
                            quality={100}
                            src={siteConfig.logoSvg}
                            width={520}
                        />
                        <span className="hidden text-lg font-semibold tracking-tight sm:inline">
                            {siteConfig.name}
                        </span>
                    </Link>

                    {/* Center: Desktop Nav (doc-style tabs) */}
                    <div className="hidden items-center gap-0.5 rounded-full border border-border/50 bg-muted/30 p-1 backdrop-blur-sm md:flex">
                        {primaryNav.map((tab, idx) => {
                            return (
                                <NavbarDocked
                                    active={isActive(tab.path)}
                                    Icon={tab.icon}
                                    key={`${tab.path}-${idx}`}
                                    tab={tab}
                                />
                            );
                        })}
                    </div>

                    {/* Right: Search + Profile + Actions */}
                    <div className="flex items-center gap-1.5">
                        {/* Search Button */}
                        <SmartTooltip
                            content={'Search (Ctrl+K)'}
                            trigger={
                                <Button
                                    className="h-9 w-9 rounded-full"
                                    onClick={() => setSearchOpen(true)}
                                    size="icon"
                                    variant="ghost"
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            }
                        />

                        {/* Secondary nav items (desktop only) */}
                        <div className="hidden items-center gap-0.5 md:flex">
                            {secondaryNav.map((tab) => {
                                const Icon = tab.icon;

                                return (
                                    <Link
                                        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                                            isActive(tab.path)
                                                ? 'bg-accent text-accent-foreground'
                                                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                                        }`}
                                        href={tab.path as '/'}
                                        key={tab.path}
                                    >
                                        <SmartTooltip
                                            content={tab.title}
                                            trigger={<Icon className="h-4 w-4" />}
                                        />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Separator */}
                        <div className="mx-1 hidden h-6 w-px bg-border md:block" />

                        {/* Auth Section */}
                        <NavbarAuth
                            isAdmin={isAdmin}
                            pathname={pathname}
                            status={status}
                            user={session?.user}
                        />

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
                    <NavMobileDrawer
                        isActive={isActive}
                        isAdmin={isAdmin}
                        pathname={pathname}
                        primaryNav={primaryNav}
                        secondaryNav={secondaryNav}
                        setMobileOpen={setMobileOpen}
                        user={session?.user}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
