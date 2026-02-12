'use client';

import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';

interface Tab {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    type?: never;
}

interface Separator {
    type: 'separator';
    title?: never;
    icon?: never;
    path?: never;
}

export type TabItem = Tab | Separator;

interface DocTabsProps {
    tabs: TabItem[];
    className?: string;
}

const spanVariants: Variants = {
    initial: { width: 0, opacity: 0 },
    animate: {
        width: 'auto',
        opacity: 1,
        transition: { delay: 0.05, duration: 0.2, ease: 'easeOut' },
    },
    exit: {
        width: 0,
        opacity: 0,
        transition: { duration: 0.1, ease: 'easeIn' },
    },
};

export default function DocTabs({ tabs, className }: DocTabsProps) {
    const [selected, setSelected] = useState<string>('/');
    const router = useRouter();


    const handleSelect = (path: string) => {
        setSelected(path);
        router.push(path as '/')
    };

    const SeparatorComponent = () => (
        <div aria-hidden="true" className="h-7 w-px bg-slate-200 dark:bg-slate-700" />
    );

    return (
        <div
            className={`flex items-center gap-1 rounded-full border border-slate-200 bg-white/70 dark:bg-black dark:border-slate-700 p-1 shadow-md backdrop-blur-sm ${
                className || ''
            }`}
        >
            {tabs.map((tab, index) => {
                if (tab.type === 'separator') {
                    return <SeparatorComponent key={`separator-${index}`} />;
                }

                const Icon = tab.icon;
                const isSelected = selected === tab.path;

                return (
                    <button
                        className={`relative z-10 flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none 
              ${
                  isSelected
                      ? 'text-slate-900 dark:text-green-300'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100'
              }
            `}
                        key={tab.title}
                        onClick={() => handleSelect(tab.path)}
                    >
                        {isSelected && (
                            <motion.div
                                className="absolute inset-0 z-0 rounded-full bg-white dark:bg-green-500/20 backdrop-blur-sm border border-green-400/30 shadow-sm"
                                layoutId="pill"
                                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                            />
                        )}

                        <span title={tab.title} className="relative z-10 flex items-center gap-2">
                            <Icon className="h-5 w-5 shrink-0" />
                            <AnimatePresence initial={false}>
                                {isSelected && (
                                    <motion.span
                                        animate="animate"
                                        className="overflow-hidden whitespace-nowrap"
                                        exit="exit"
                                        initial="initial"
                                        variants={spanVariants}
                                    >
                                        {tab.title}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
