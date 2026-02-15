import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import type { ComponentType } from 'react';
import SmartTooltip from '@/components/smart-tooltip';
import type { TabItem } from '@/components/ui/doc-tabs';

type Props = {
    active: boolean;
    tab: Extract<TabItem, { path: string }>;
    Icon: ComponentType<{
        className?: string;
    }>;
};

export default function NavbarDocked({ active, tab, Icon }: Props) {
    return (
        <Link
            className={`relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
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
                <SmartTooltip content={tab.title} trigger={<Icon className="h-4 w-4" />} />
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
}
