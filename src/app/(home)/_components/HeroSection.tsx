'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Github, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/configs/site';

/**
 * Hero section for the homepage with introduction and CTAs.
 */
export function HeroSection() {
    return (
        <section className="relative flex min-h-[85vh] items-center overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-accent/10" />
            <div className="absolute top-1/4 -right-1/4 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-1/4 -left-1/4 -z-10 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

            <div className="mx-auto max-w-6xl px-4 py-20">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-6"
                        initial={{ opacity: 0, y: 30 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-1 w-12 rounded-full bg-primary" />
                            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                Full-Stack Developer
                            </span>
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                            Hi, I&apos;m{' '}
                            <span className="bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-violet-400">
                                {siteConfig.name}
                            </span>
                        </h1>

                        <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                            I build modern, performant, and accessible web applications.
                            Passionate about clean code, great user experiences, and sharing
                            knowledge through open source and blogging.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <Button asChild size="lg">
                                <Link href="/projects">
                                    View Projects <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href="/blogs">Read My Blog</Link>
                            </Button>
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <a
                                aria-label="GitHub"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                                href={siteConfig.links.github}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <Github className="h-5 w-5" />
                            </a>
                            <a
                                aria-label="LinkedIn"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                                href={siteConfig.links.linkedin}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a
                                aria-label="Twitter"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                                href={siteConfig.links.twitter}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative hidden lg:block"
                        initial={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="relative mx-auto h-80 w-80">
                            <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-500/20 to-violet-500/20 blur-2xl" />
                            <div className="relative flex h-full w-full items-center justify-center rounded-full border border-border/50 bg-card/50 backdrop-blur-sm">
                                <span className="text-8xl">👨‍💻</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
