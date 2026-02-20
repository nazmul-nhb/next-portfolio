'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { Button } from '@/components/ui/button';
import FloatingButton from '@/components/ui/floating-button';
import { siteConfig } from '@/configs/site';

/** Check if a menu item is the active route. */
function isActive(href: string, pathname: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
}

/** Admin sidebar with active route highlighting and mobile drawer. */
export function AdminSidebar() {
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Close drawer on route change
    useEffect(() => {
        if (pathname) {
            setDrawerOpen(false);
        }
    }, [pathname]);

    const NavContent = () => (
        <Fragment>
            <div className="border-b border-border p-5">
                <h2 className="text-lg font-bold tracking-tight">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Manage your portfolio</p>
            </div>

            <nav className="flex-1 space-y-0.5 p-3">
                {siteConfig.adminMenus.map((item) => {
                    const active = isActive(item.href, pathname);
                    return (
                        <Link
                            className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                active
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }`}
                            href={item.href as '/'}
                            key={item.href}
                            onClick={() => setDrawerOpen(false)}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-border p-3">
                <Link
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    href="/"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Site
                </Link>
            </div>
        </Fragment>
    );

    return (
        <Fragment>
            {/* Desktop Sidebar */}
            <aside className="hidden w-60 shrink-0 border-r border-border bg-card/50 md:block">
                <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col">
                    <NavContent />
                </div>
            </aside>

            {/* Mobile Toggle Button (fixed) */}
            <FloatingButton
                className="md:hidden"
                icon={Menu}
                onClick={() => setDrawerOpen(true)}
                position="bottom-left"
            />

            {/* Mobile Drawer */}
            <AnimatePresence>
                {drawerOpen && (
                    <Fragment>
                        <motion.div
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 z-60 bg-background/60 backdrop-blur-sm md:hidden"
                            exit={{ opacity: 0 }}
                            initial={{ opacity: 0 }}
                            onClick={() => setDrawerOpen(false)}
                        />
                        <motion.aside
                            animate={{ x: 0 }}
                            className="fixed inset-y-0 left-0 z-70 flex w-64 flex-col border-r border-border bg-background shadow-2xl md:hidden"
                            exit={{ x: '-100%' }}
                            initial={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        >
                            <div className="flex items-center justify-between border-b border-border p-4">
                                <span className="text-sm font-semibold">Admin Panel</span>
                                <Button
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => setDrawerOpen(false)}
                                    size="icon"
                                    variant="ghost"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
                                {siteConfig.adminMenus.map((item) => {
                                    const active = isActive(item.href, pathname);
                                    return (
                                        <Link
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                                active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                            }`}
                                            href={item.href}
                                            key={item.href}
                                            onClick={() => setDrawerOpen(false)}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                            <div className="border-t border-border p-3">
                                <Link
                                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                    href="/"
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Site
                                </Link>
                            </div>
                        </motion.aside>
                    </Fragment>
                )}
            </AnimatePresence>
        </Fragment>
    );
}
