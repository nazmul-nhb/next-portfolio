'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Camera, Cat, Github, Linkedin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ENV } from '@/configs/env';
import { siteConfig } from '@/configs/site';
import { httpRequest } from '@/lib/actions/baseRequest';
import { uploadToCloudinary } from '@/lib/actions/cloudinary';

interface HeroSectionProps {
    adminImage?: string | null;
}

/**
 * Hero section for the homepage with introduction and CTAs.
 * Admin can click the hero image to update it.
 */
export function HeroSection({ adminImage }: HeroSectionProps) {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [heroImage, setHeroImage] = useState(adminImage || null);
    const [uploading, setUploading] = useState(false);

    const handleImageUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const result = await uploadToCloudinary(file, 'profile-images');
            const cloudinaryPath = result.url.split('/upload/')[1];
            setHeroImage(cloudinaryPath);

            await httpRequest('/api/users/me', {
                method: 'PATCH',
                body: { profile_image: cloudinaryPath },
            });
            toast.success('Hero image updated!');
        } catch {
            toast.error('Failed to update image');
        } finally {
            setUploading(false);
        }
    };

    const imageUrl = heroImage
        ? heroImage.startsWith('http')
            ? heroImage
            : `${ENV.cloudinary.urls.base_url}${heroImage}`
        : null;
    return (
        <section className="relative flex min-h-[85vh] items-center overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 -z-10 bg-linear-to-br from-blue-500/5 via-transparent to-violet-500/5" />
            <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                className="absolute top-1/4 -right-1/4 -z-10 h-112.5 w-112.5 rounded-full bg-blue-500/8 blur-3xl"
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                className="absolute -bottom-1/4 -left-1/4 -z-10 h-112.5 w-112.5 rounded-full bg-violet-500/8 blur-3xl"
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />

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

                        <div className="flex items-center gap-3 pt-2">
                            {[
                                {
                                    icon: Github,
                                    href: siteConfig.links.github,
                                    label: 'GitHub',
                                },
                                {
                                    icon: Linkedin,
                                    href: siteConfig.links.linkedin,
                                    label: 'LinkedIn',
                                },
                                {
                                    icon: Cat,
                                    href: siteConfig.links.discord,
                                    label: 'Discord',
                                },
                            ].map(({ icon: Icon, href, label }) => (
                                <motion.a
                                    aria-label={label}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                                    href={href}
                                    key={label}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Icon className="h-4 w-4" />
                                </motion.a>
                            ))}
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
                            <button
                                className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-border/50 bg-card/50 backdrop-blur-sm ${isAdmin ? 'cursor-pointer group' : ''}`}
                                disabled={!isAdmin}
                                onClick={() => isAdmin && fileInputRef.current?.click()}
                                type="button"
                            >
                                {imageUrl ? (
                                    <Image
                                        alt={siteConfig.name}
                                        className="h-full w-full rounded-full object-cover"
                                        height={320}
                                        src={imageUrl}
                                        width={320}
                                    />
                                ) : (
                                    <span className="text-8xl">👨‍💻</span>
                                )}
                                {isAdmin && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/40">
                                        <Camera className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                                    </div>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    </div>
                                )}
                            </button>
                            {isAdmin && (
                                <input
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpdate}
                                    ref={fileInputRef}
                                    type="file"
                                />
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
