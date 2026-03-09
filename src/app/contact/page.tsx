import { Mail, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import { FaDiscord, FaWhatsapp } from 'react-icons/fa';
import { FiGithub, FiLinkedin } from 'react-icons/fi';
import { SectionHeading, SlideInLeft, SlideInRight } from '@/components/misc/animations';
import { ENV } from '@/configs/env';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import { ContactForm } from './_components/ContactForm';

export const metadata: Metadata = {
    title: 'Contact',
    description: `Get in touch with ${siteConfig.name}. I would love to hear from you!`,
    keywords: [...siteConfig.keywords, ...Object.values(siteConfig.links)],
    alternates: { canonical: buildCanonicalUrl('/contact') },
    openGraph: {
        title: `Contact ${siteConfig.name}`,
        description: `Get in touch with ${siteConfig.name}. I would love to hear from you!`,
        url: `${siteConfig.baseUrl}/contact`,
        siteName: siteConfig.name,
    },
};

export default function ContactPage() {
    return (
        <div className="relative mx-auto max-w-6xl px-4 py-12 overflow-x-hidden">
            {/* Decorative background */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 left-0 size-72 rounded-full bg-blue-500/5 blur-3xl" />
                <div className="absolute -bottom-24 right-0 size-72 rounded-full bg-violet-500/5 blur-3xl" />
            </div>

            <SectionHeading
                align="center"
                className="mb-12"
                subtitle="Have a question, want to collaborate, or just want to say hi? Feel free to reach out!"
            >
                Get in Touch
            </SectionHeading>

            <div className="grid gap-12 lg:grid-cols-2">
                <SlideInLeft>
                    <div className="space-y-8">
                        <div>
                            <h2 className="mb-4 text-2xl font-bold">Let&apos;s Connect</h2>
                            <p className="mb-6 text-muted-foreground">
                                I&apos;m always open to discussing new projects, creative ideas,
                                or opportunities to be part of your vision. Drop me a message
                                and I&apos;ll get back to you within 24-48 hours.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <a
                                className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
                                href={`mailto:${ENV.adminEmail}`}
                            >
                                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                                    <Mail className="size-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-xs text-muted-foreground">
                                        Send me an email directly
                                    </p>
                                </div>
                            </a>

                            <a
                                className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
                                href={siteConfig.links.GitHub}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                                    <FiGithub className="size-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">GitHub</p>
                                    <p className="text-xs text-muted-foreground">
                                        Check out my open source projects
                                    </p>
                                </div>
                            </a>

                            <a
                                className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
                                href={siteConfig.links.LinkedIn}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                                    <FiLinkedin className="size-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">LinkedIn</p>
                                    <p className="text-xs text-muted-foreground">
                                        Connect with me professionally
                                    </p>
                                </div>
                            </a>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <a
                                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:bg-[#25D366]/10"
                                    href={siteConfig.links.WhatsApp}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <FaWhatsapp className="size-5 text-primary" />
                                    <span className="text-sm font-medium">WhatsApp</span>
                                </a>
                                <a
                                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:bg-[#1877F2]/10"
                                    href={siteConfig.links.Discord}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <FaDiscord className="size-5 text-primary" />
                                    <span className="text-sm font-medium">Discord</span>
                                </a>
                                <a
                                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:bg-primary/10"
                                    href={`tel:${siteConfig.mobile}`}
                                >
                                    <Phone className="size-5 text-primary" />
                                    <span className="text-sm font-medium">Call Now</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </SlideInLeft>

                <SlideInRight>
                    <div
                        className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm sm:p-8"
                        id="send-message"
                    >
                        <h2 className="mb-6 text-xl font-bold">Send a Message</h2>
                        <ContactForm />
                    </div>
                </SlideInRight>
            </div>
        </div>
    );
}
