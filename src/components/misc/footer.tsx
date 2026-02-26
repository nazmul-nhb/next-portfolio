'use client';

import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FaDiscord, FaWhatsapp } from 'react-icons/fa';
import { FiGithub, FiLinkedin } from 'react-icons/fi';
import { siteConfig } from '@/configs/site';
import { getCurrentYear } from '@/lib/utils';

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    github: FiGithub,
    linkedin: FiLinkedin,
    discord: FaDiscord,
    whatsapp: FaWhatsapp,
};

const quickLinks: { label: string; href: Route }[] = [
    { label: 'Home', href: '/' },
    { label: 'Blogs', href: '/blogs' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

const resourceLinks: { label: string; href: Route }[] = [
    { label: 'Projects', href: '/projects' },
    { label: 'Resume', href: '/resume' },
    { label: 'Messages', href: '/messages' },
];

export default function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 py-12">
                {/* Main grid */}
                <div className="mx-auto grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-1 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <Image
                                alt={siteConfig.name}
                                className="h-8 w-8 rounded-full object-fit"
                                height={520}
                                quality={100}
                                src={siteConfig.logoSvg}
                                width={520}
                            />
                            <span className="text-lg font-semibold">{siteConfig.name}</span>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
                            {siteConfig.description}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                            Quick Links
                        </h3>
                        <nav className="flex flex-col gap-2.5 items-start">
                            {quickLinks.map((link) => (
                                <Link
                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    href={link.href}
                                    key={link.href}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                            Resources
                        </h3>
                        <nav className="flex flex-col gap-2.5">
                            {resourceLinks.map((link) => (
                                <Link
                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    href={link.href}
                                    key={link.href}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Connect */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                            Connect
                        </h3>
                        <div className="flex flex-col gap-2.5">
                            {Object.entries(siteConfig.links).map(([name, url]) => {
                                const Icon = socialIcons[name];
                                return (
                                    <a
                                        className="inline-flex items-center gap-2 text-sm text-muted-foreground capitalize transition-colors hover:text-foreground"
                                        href={url}
                                        key={name}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <Icon className="size-4" />
                                        {name}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border/40 pt-6 sm:flex-row">
                    <p className="text-xs text-muted-foreground">
                        &copy; {getCurrentYear()} {siteConfig.name}. All rights reserved.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Built with Next.js & TypeScript
                    </p>
                </div>
            </div>
        </footer>
    );
}
