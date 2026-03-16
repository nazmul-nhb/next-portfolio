'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { Button } from '@/components/ui/button';
import FloatingButton from '@/components/ui/floating-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { siteConfig } from '@/configs/site';

export function ToolsSidebar() {
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = useState(false);

    function isActive(href: `/${string}`) {
        if (href === '/tools') return pathname === '/tools';
        return pathname.startsWith(href.split('?')[0]);
    }

    useEffect(() => {
        if (pathname) setDrawerOpen(false);
    }, [pathname]);

    const NavContent = () => (
        <Fragment>
            <div className="border-b border-border p-5">
                <h2 className="text-lg font-bold tracking-tight">Tools</h2>
                <p className="text-xs text-muted-foreground">Personal productivity utilities</p>
            </div>

            <nav>
                <ScrollArea
                    className="h-[calc(100vh-9.75rem)] scroll-smooth **:data-radix-scroll-area-viewport:scroll-smooth space-y-0.5 p-3"
                    role="navigation"
                >
                    <Link
                        className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive('/tools')
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                        href="/tools"
                        onClick={() => setDrawerOpen(false)}
                    >
                        All Tools
                    </Link>
                    {siteConfig.toolsMenus.map((item) => {
                        return (
                            <Link
                                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                    isActive(item.href)
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                                href={item.href}
                                key={item.href}
                                onClick={() => setDrawerOpen(false)}
                            >
                                <item.icon className="size-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </ScrollArea>
            </nav>

            <div className="border-t border-border p-3">
                <Link
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    href="/"
                >
                    <ArrowLeft className="size-4" />
                    Back to Site
                </Link>
            </div>
        </Fragment>
    );

    return (
        <Fragment>
            <aside className="hidden w-fit shrink-0 border-r border-border bg-card/50 md:block">
                <div className="sticky top-16 h-[calc(100vh-4rem)]">
                    <NavContent />
                </div>
            </aside>

            <FloatingButton
                className="md:hidden"
                icon={Menu}
                onClick={() => setDrawerOpen(true)}
                position="bottom-left"
            />

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
                                <span className="text-sm font-semibold">Tools</span>
                                <Button
                                    className="size-8 rounded-full"
                                    onClick={() => setDrawerOpen(false)}
                                    size="icon"
                                    variant="ghost"
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>
                            <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
                                <Link
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                        pathname === '/tools'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                    }`}
                                    href="/tools"
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    All Tools
                                </Link>
                                {siteConfig.toolsMenus.map((item) => {
                                    return (
                                        <Link
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                                isActive(item.href)
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                            }`}
                                            href={item.href}
                                            key={item.href}
                                            onClick={() => setDrawerOpen(false)}
                                        >
                                            <item.icon className="size-4" />
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
                                    <ArrowLeft className="size-4" />
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
