'use client';

import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface Ripple {
    id: number;
    x: number;
    y: number;
    size: number;
}

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-primary/90',
                destructive:
                    'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
                outline:
                    'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-9 px-4 py-2 has-[>svg]:px-3',
                sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
                lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
                icon: 'size-9',
                'icon-sm': 'size-8',
                'icon-lg': 'size-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

 interface ButtonProps extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
        asChild?: boolean;
        loading?: boolean;
    }

function Button({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    disabled,
    children,
    onClick,
    ref,
    ...props
}: ButtonProps) {
    const Comp = asChild ? Slot.Slot : 'button';
    const internalRef = React.useRef<HTMLButtonElement>(null);
    const [ripples, setRipples] = React.useState<Ripple[]>([]);

    // Compose internal ref with external ref (from Radix Slot, etc.)
    const composedRef = React.useCallback(
        (node: HTMLButtonElement | null) => {
            internalRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        },
        [ref]
    );

    // Handle ripple effect on click
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) return;

        const button = internalRef.current;
        if (button) {
            // Calculate ripple position - centered on click point
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const newRipple: Ripple = {
                id: Date.now(),
                x,
                y,
                size: Math.max(rect.width, rect.height),
            };

            setRipples((prev) => [...prev, newRipple]);

            // Remove ripple after animation
            setTimeout(() => {
                setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
            }, 900);
        }

        // Always call onClick — even if ref isn't available (e.g. inside Radix Slot)
        onClick?.(e);
    };

    // When using asChild, Slot expects a single child, so we can't add effects
    if (asChild) {
        return (
            <Comp
                data-slot="button"
                className={cn(buttonVariants({ variant, size, className }))}
                onClick={onClick}
                {...props}
            >
                {children}
            </Comp>
        );
    }

    return (
        <Comp
            ref={composedRef}
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }), 'relative overflow-hidden')}
            disabled={disabled || loading}
            onClick={handleClick}
            {...props}
        >
            {loading && <Loader2 className="animate-spin" />}
            {children}

            {/* Ripple effects - horizontal shine spreading left and right */}
            <AnimatePresence>
                {ripples.map((ripple) => (
                    <motion.span
                        key={ripple.id}
                        className="pointer-events-none absolute"
                        style={{
                            left: ripple.x,
                            top: 0,
                            height: '100%',
                            width: '4px',
                            background: 'rgba(255, 255, 255, 0.6)',
                            transform: 'translateX(-50%)',
                        }}
                        initial={{
                            opacity: 0.7,
                            scaleX: 1,
                        }}
                        animate={{
                            opacity: 0,
                            scaleX: ripple.size,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.9,
                            ease: [0.4, 0, 0.2, 1],
                        }}
                    />
                ))}
            </AnimatePresence>
        </Comp>
    );
}

export { Button, buttonVariants, type ButtonProps};
