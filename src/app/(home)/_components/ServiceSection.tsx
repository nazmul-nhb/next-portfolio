'use client';

import { motion, type Variants } from 'framer-motion';
import {
    CheckCircle,
    Code2,
    Handshake,
    Layers,
    Layout,
    Package,
    Puzzle,
    Server,
} from 'lucide-react';
import Link from 'next/link';
import { SectionHeading, StaggerContainer } from '@/components/misc/animations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const serviceVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (idx: number) => ({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: 'easeOut', delay: idx * 0.1 },
    }),
};

const services = [
    {
        icon: <Layers className="size-6 text-violet-400" />,
        title: 'Full-Stack Web Development',
        points: [
            'Design end-to-end solutions combining excellent front-ends with robust backends',
            'Architect efficient database schemas with PostgreSQL or MongoDB',
            'Implement complete features from UI to API with proper testing',
        ],
        accentColor: 'bg-violet-500/15',
    },
    {
        icon: <Layout className="size-6 text-rose-400" />,
        title: 'Frontend Development',
        points: [
            'Craft beautiful, responsive interfaces with TailwindCSS and modern UI components',
            'Implement smooth animations and delightful interactions with Framer Motion',
            'Focus on accessibility, performance, and exceptional user experiences',
        ],
        accentColor: 'bg-rose-500/15',
    },
    {
        icon: <Server className="size-6 text-cyan-400" />,
        title: 'Backend Development',
        points: [
            'Build scalable APIs using Node.js with Express or NestJS',
            'Design optimized databases using PostgreSQL or MongoDB',
            'Implement authentication, validation, and error handling',
        ],
        accentColor: 'bg-cyan-500/15',
    },
    {
        icon: <Code2 className="size-6 text-blue-400" />,
        title: 'Custom Web Application Development',
        points: [
            'Build scalable, performant applications with React, Next.js, and TypeScript',
            'Create robust backend APIs using Node.js, Express, and NestJS',
            'Deploy production-ready solutions with optimized performance',
        ],
        accentColor: 'bg-blue-500/15',
    },
    {
        icon: <Puzzle className="size-6 text-yellow-400" />,
        title: 'Chrome Extension Development',
        points: [
            'Develop powerful browser extensions with React and Manifest V3',
            'Build content scripts, background workers, and popup interfaces',
            'Create engaging user experiences that enhance productivity',
        ],
        accentColor: 'bg-yellow-500/15',
    },
    {
        icon: <Package className="size-6 text-emerald-400" />,
        title: 'JavaScript Library Development',
        points: [
            'Create reusable, well-documented libraries for the developer community',
            'Maintain high code quality with Jest or Vitest coverage',
            'Publish and maintain packages on NPM with proper versioning and changelogs',
        ],
        accentColor: 'bg-emerald-500/15',
    },
];

export function ServiceSection() {
    return (
        <section className="py-8 sm:py-14 md:py-20">
            <div className="mx-auto max-w-6xl px-4">
                <SectionHeading
                    className="mb-12"
                    subtitle="Specialized services tailored to bring your vision to life"
                >
                    What I Offer
                </SectionHeading>

                <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((service, idx) => (
                        <motion.div
                            className="h-full"
                            custom={idx}
                            key={service.title}
                            variants={serviceVariants}
                        >
                            <ServiceCard
                                accentColor={service.accentColor}
                                icon={service.icon}
                                points={service.points}
                                title={service.title}
                            />
                        </motion.div>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}

interface ServiceCardProps {
    icon: React.ReactNode;
    title: string;
    points: string[];
    accentColor: string;
}

function ServiceCard({ icon, title, points, accentColor }: ServiceCardProps) {
    return (
        <motion.div
            className="h-full"
            custom={0}
            variants={serviceVariants}
            whileHover={{
                y: -4,
                transition: { duration: 0.2, ease: 'easeOut' },
            }}
        >
            <Card className="group flex flex-col h-full border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <div className={cn('rounded-lg p-2', accentColor)}>{icon}</div>
                        <h3 className="text-lg font-semibold leading-tight">{title}</h3>
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-3 pl-5">
                    {points.map((point) => (
                        <div className="flex items-start gap-3" key={point}>
                            <CheckCircle className="size-4 shrink-0 text-green-500 mt-0.5" />
                            <span className="text-sm text-muted-foreground leading-relaxed">
                                {point}
                            </span>
                        </div>
                    ))}
                </CardContent>

                <CardFooter className="py-1">
                    <Button asChild variant="link">
                        <Link href={`/contact?subject=${title}`}>
                            <Handshake /> Book a Consultation
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
