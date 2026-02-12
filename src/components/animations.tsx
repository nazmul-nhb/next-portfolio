'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
};

const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
};

const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
};

const slideInRight: Variants = {
    hidden: { opacity: 0, x: 40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
};

const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};

interface AnimatedProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

/**
 * Fade-in-up animation wrapper. Triggers when element enters viewport.
 */
export function FadeInUp({ children, className, delay = 0 }: AnimatedProps) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            variants={{
                ...fadeInUp,
                visible: {
                    ...fadeInUp.visible,
                    transition: { duration: 0.5, ease: 'easeOut', delay },
                },
            }}
            viewport={{ once: true, amount: 0.2 }}
            whileInView="visible"
        >
            {children}
        </motion.div>
    );
}

/**
 * Simple fade-in animation wrapper.
 */
export function FadeIn({ children, className, delay = 0 }: AnimatedProps) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            variants={{
                ...fadeIn,
                visible: {
                    ...fadeIn.visible,
                    transition: { duration: 0.5, ease: 'easeOut', delay },
                },
            }}
            viewport={{ once: true, amount: 0.2 }}
            whileInView="visible"
        >
            {children}
        </motion.div>
    );
}

/**
 * Slide-in from left animation wrapper.
 */
export function SlideInLeft({ children, className, delay = 0 }: AnimatedProps) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            variants={{
                ...slideInLeft,
                visible: {
                    ...slideInLeft.visible,
                    transition: { duration: 0.5, ease: 'easeOut', delay },
                },
            }}
            viewport={{ once: true, amount: 0.2 }}
            whileInView="visible"
        >
            {children}
        </motion.div>
    );
}

/**
 * Slide-in from right animation wrapper.
 */
export function SlideInRight({ children, className, delay = 0 }: AnimatedProps) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            variants={{
                ...slideInRight,
                visible: {
                    ...slideInRight.visible,
                    transition: { duration: 0.5, ease: 'easeOut', delay },
                },
            }}
            viewport={{ once: true, amount: 0.2 }}
            whileInView="visible"
        >
            {children}
        </motion.div>
    );
}

/**
 * Stagger children animation wrapper.
 */
export function StaggerContainer({ children, className }: Omit<AnimatedProps, 'delay'>) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            variants={stagger}
            viewport={{ once: true, amount: 0.1 }}
            whileInView="visible"
        >
            {children}
        </motion.div>
    );
}

/**
 * Scale-in animation for child items (use inside StaggerContainer).
 */
export function ScaleInItem({ children, className }: Omit<AnimatedProps, 'delay'>) {
    return (
        <motion.div className={className} variants={scaleIn}>
            {children}
        </motion.div>
    );
}
