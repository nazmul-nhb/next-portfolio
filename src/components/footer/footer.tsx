import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FaDiscord, FaWhatsapp } from 'react-icons/fa';
import { FiGithub, FiLinkedin, FiMail, FiPhone } from 'react-icons/fi';
import FooterBottom from '@/components/footer/footer-bottom';
import { ENV } from '@/configs/env';
import { siteConfig } from '@/configs/site';

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
    const { mobile } = siteConfig;
    const { adminEmail } = ENV;

    return (
        <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 py-12">
                {/* Top section: Brand + Navigation columns */}
                <div className="flex flex-col items-center gap-10 text-center md:flex-row md:items-start md:justify-between md:text-left">
                    {/* Brand */}
                    <div className="flex max-w-xs flex-col items-center gap-3 md:items-start">
                        <div className="flex items-center gap-2.5">
                            <Image
                                alt={siteConfig.name}
                                className="h-8 w-8 rounded-full object-fit"
                                height={520}
                                loading="eager"
                                quality={100}
                                src={siteConfig.logoSvg}
                                width={520}
                            />
                            <span className="text-lg font-semibold">{siteConfig.name}</span>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {siteConfig.description}
                        </p>
                        <div className="flex flex-col items-center gap-2.5 md:items-start">
                            <a
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                href={`tel:${mobile}`}
                            >
                                <FiPhone className="size-4" />
                                <span>{mobile}</span>
                            </a>
                            <a
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                href={`mailto:${adminEmail}`}
                            >
                                <FiMail className="size-4" />
                                <span>{adminEmail}</span>
                            </a>
                        </div>
                    </div>

                    {/* Navigation columns */}
                    <div className="flex flex-wrap justify-center gap-12 sm:gap-16 md:justify-end">
                        {/* Quick Links */}
                        <div className="flex flex-col items-center md:items-start">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                                Quick Links
                            </h3>
                            <nav className="flex flex-col items-center gap-2.5 md:items-start">
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
                        <div className="flex flex-col items-center md:items-start">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                                Resources
                            </h3>
                            <nav className="flex flex-col items-center gap-2.5 md:items-start">
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
                        <div className="flex flex-col items-center md:items-start">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                                Connect
                            </h3>
                            <div className="flex flex-col items-center gap-2.5 md:items-start">
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
                </div>

                {/* Bottom bar */}
                <FooterBottom />
            </div>
        </footer>
    );
}
