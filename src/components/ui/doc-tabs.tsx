'use client';

import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useClickOutside } from 'nhb-hooks';
import React, { useState } from 'react';

interface Tab {
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	type?: never;
}

interface Separator {
	type: 'separator';
	title?: never;
	icon?: never;
}

type TabItem = Tab | Separator;

interface DocTabsProps {
	tabs: TabItem[];
	className?: string;
	onChange?: (index: number | null) => void;
}

const spanVariants: Variants = {
	initial: { width: 0, opacity: 0 },
	animate: {
		width: 'auto',
		opacity: 1,
		transition: { delay: 0.05, duration: 0.2, ease: 'easeOut' as const },
	},
	exit: {
		width: 0,
		opacity: 0,
		transition: { duration: 0.1, ease: 'easeIn' as const },
	},
};

export default function DocTabs({ tabs, className, onChange }: DocTabsProps) {
	const [selected, setSelected] = useState<number | null>(0);

	const containerRef = useClickOutside<HTMLDivElement>(() => {
		setSelected(null);
	});

	const handleSelect = (index: number) => {
		setSelected(index);
		if (onChange) onChange(index);
	};

	const SeparatorComponent = () => (
		<div className="h-7 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
	);

	return (
		<div
			ref={containerRef}
			className={`flex items-center gap-1 rounded-full border border-slate-200 bg-white/70 dark:bg-black dark:border-slate-700 p-1 shadow-md backdrop-blur-sm ${
				className || ''
			}`}
		>
			{tabs.map((tab, index) => {
				if (tab.type === 'separator') {
					return <SeparatorComponent key={`separator-${index}`} />;
				}

				const Icon = tab.icon;
				const isSelected = selected === index;

				return (
					<button
						key={tab.title}
						onClick={() => handleSelect(index)}
						className={`relative z-10 flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none 
              ${
					isSelected
						? 'text-slate-900 dark:text-green-300'
						: 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100'
				}
            `}
					>
						{isSelected && (
							<motion.div
								layoutId="pill"
								className="absolute inset-0 z-0 rounded-full bg-white dark:bg-green-500/20 backdrop-blur-sm border border-green-400/30 shadow-sm"
								transition={{ type: 'spring', stiffness: 500, damping: 40 }}
							/>
						)}

						<span className="relative z-10 flex items-center gap-2">
							<Icon className="h-5 w-5 shrink-0" />
							<AnimatePresence initial={false}>
								{isSelected && (
									<motion.span
										variants={spanVariants}
										initial="initial"
										animate="animate"
										exit="exit"
										className="overflow-hidden whitespace-nowrap"
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
