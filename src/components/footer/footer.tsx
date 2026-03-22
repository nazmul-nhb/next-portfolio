import Image from 'next/image';
import Link from 'next/link';
import { FiMail, FiPhone } from 'react-icons/fi';
import FooterBottom from '@/components/footer/footer-bottom';
import { ENV } from '@/configs/env';
import { QUICK_LINKS, RESOURCE_LINKS, SOCIAL_LINKS, siteConfig } from '@/configs/site';

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
                                className="size-8 rounded-full object-fit"
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
                                {QUICK_LINKS.map((link) => (
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
                                {RESOURCE_LINKS.map((link) => (
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
                                {SOCIAL_LINKS.map(({ Icon, href, label }) => {
                                    return (
                                        <a
                                            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                            href={href}
                                            key={label}
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        >
                                            <Icon className="size-4" />
                                            {label}
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
