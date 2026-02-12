import { Github, Linkedin, Mail, MessageSquare, Twitter } from 'lucide-react';
import type { Metadata } from 'next';
import { FadeInUp, SlideInLeft, SlideInRight } from '@/components/animations';
import { siteConfig } from '@/configs/site';
import { ContactForm } from './_components/ContactForm';

export const metadata: Metadata = {
    title: 'Contact',
    description: 'Get in touch with me. I would love to hear from you!',
};

export default function ContactPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-12">
            <FadeInUp>
                <div className="mb-12 text-center">
                    <h1 className="mb-3 text-4xl font-bold tracking-tight">Get in Touch</h1>
                    <p className="mx-auto max-w-lg text-lg text-muted-foreground">
                        Have a question, want to collaborate, or just want to say hi? Feel free
                        to reach out!
                    </p>
                </div>
            </FadeInUp>

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
                                href={`mailto:${siteConfig.links.github.replace('https://github.com/', '')}@gmail.com`}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Mail className="h-5 w-5 text-primary" />
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
                                href={siteConfig.links.github}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Github className="h-5 w-5 text-primary" />
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
                                href={siteConfig.links.linkedin}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Linkedin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">LinkedIn</p>
                                    <p className="text-xs text-muted-foreground">
                                        Connect with me professionally
                                    </p>
                                </div>
                            </a>

                            <div className="flex gap-3">
                                <a
                                    className="flex flex-1 items-center gap-3 rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
                                    href={siteConfig.links.twitter}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <Twitter className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">Twitter</span>
                                </a>
                                <a
                                    className="flex flex-1 items-center gap-3 rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
                                    href={siteConfig.links.discord}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">Discord</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </SlideInLeft>

                <SlideInRight>
                    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">
                        <h2 className="mb-6 text-xl font-bold">Send a Message</h2>
                        <ContactForm />
                    </div>
                </SlideInRight>
            </div>
        </div>
    );
}
