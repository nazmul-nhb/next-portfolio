'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Delete, Keyboard, X } from 'lucide-react';
import { useClickOutside } from 'nhb-hooks';
import { isBrowser } from 'nhb-toolbox';
import { Fragment, type RefObject, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
    hasSelection: boolean;
    isPaused: boolean;
    gridRef: RefObject<HTMLDivElement | null>;
    onInput: (value: number) => void;
}

function isTouchFirstInputDevice() {
    if (!isBrowser()) return false;

    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const noHover = window.matchMedia('(any-hover: none)').matches;
    const touchCapable = coarsePointer || navigator.maxTouchPoints > 0;

    return touchCapable && noHover;
}

const keypadNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function KeypadDrawer({ hasSelection, isPaused, gridRef, onInput }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const keyPadRef = useRef<HTMLDivElement>(null);

    useClickOutside([keyPadRef, gridRef], () => setIsOpen(false));

    useEffect(() => {
        const touchFirst = isTouchFirstInputDevice();

        setIsOpen(touchFirst);
    }, []);

    if (isPaused) return null;

    return (
        <Fragment>
            <AnimatePresence initial={false}>
                <motion.div
                    animate={{ opacity: 1, x: 0 }}
                    className="fixed right-4 top-1/4 z-60 -translate-y-1/2"
                    exit={{ opacity: 0, x: 10 }}
                    initial={{ opacity: 0, x: 10 }}
                >
                    <Button
                        className={cn('rounded-full shadow-xl')}
                        onClick={() => setIsOpen(true)}
                        size="icon-lg"
                        type="button"
                        variant="outline"
                    >
                        <Keyboard className="size-4" />
                    </Button>
                </motion.div>
            </AnimatePresence>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.aside
                        animate={{ opacity: 1, x: 0 }}
                        aria-label="Sudoku keypad"
                        className="fixed right-4 top-1/4 z-60 w-[min(18rem,fit-content)] -translate-y-1/2"
                        exit={{ opacity: 0, x: 24 }}
                        initial={{ opacity: 0, x: 24 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    >
                        <div
                            className="overflow-hidden w-fit rounded-2xl border border-border/70 bg-card/95 shadow-2xl select-none backdrop-blur-md"
                            ref={keyPadRef}
                        >
                            <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-semibold leading-none">Keypad</p>
                                    <p className="text-xs text-muted-foreground">
                                        {hasSelection
                                            ? 'Tap a number to fill the selected cell.'
                                            : 'Select a cell first.'}
                                    </p>
                                </div>

                                <Button
                                    aria-label="Close keypad"
                                    className="size-8 rounded-full"
                                    onClick={() => setIsOpen(false)}
                                    size="icon"
                                    variant="ghost"
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>

                            <div className="space-y-3 p-3">
                                <div className="flex flex-wrap gap-1">
                                    {keypadNumbers.map((value) => (
                                        <Button
                                            className="aspect-square text-sm font-semibold"
                                            disabled={!hasSelection}
                                            key={value}
                                            onClick={() => onInput(value)}
                                            type="button"
                                            variant="outline"
                                        >
                                            {value}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    className="w-full"
                                    disabled={!hasSelection}
                                    onClick={() => onInput(0)}
                                    type="button"
                                    variant="destructive"
                                >
                                    <Delete className="size-4" />
                                    Clear cell
                                </Button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </Fragment>
    );
}
