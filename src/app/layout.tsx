import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Navbar from '@/components/navbar';
import ThemeToggler from '@/components/theme-toggler';
import { Toaster } from '@/components/ui/sonner';
import { siteConfig } from '@/configs/site';
import { AuthProvider } from '@/providers/auth-provider';
import { ReactQueryProvider } from '@/providers/query-provider';
import { NextThemesProvider } from '@/providers/theme-provider';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [
        'web developer',
        'portfolio',
        'blog',
        'nazmul hassan',
        'full-stack developer',
        'next.js',
        'react',
    ],
    authors: [{ name: siteConfig.name }],
    openGraph: {
        title: siteConfig.name,
        description: siteConfig.description,
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <link href="favicon.png" rel="shortcut icon" type="image/png" />
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                suppressHydrationWarning
            >
                <AuthProvider>
                    <ReactQueryProvider>
                        <NextThemesProvider
                            attribute="class"
                            defaultTheme="dark"
                            themes={['dark', 'light']}
                        >
                            <Navbar />
                            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
                            <Footer />
                            <ThemeToggler />
                            <Toaster />
                        </NextThemesProvider>
                    </ReactQueryProvider>
                </AuthProvider>
            </body>
        </html>
    );
}

/** Site footer with links and copyright. */
function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
            <div className="mx-auto max-w-6xl px-4 py-10">
                <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-violet-600 text-xs font-bold text-white">
                            NH
                        </div>
                        <span className="font-semibold">{siteConfig.name}</span>
                    </div>
                    <div className="flex gap-5">
                        {Object.entries(siteConfig.links).map(([name, url]) => (
                            <a
                                className="text-sm text-muted-foreground capitalize transition-colors hover:text-foreground"
                                href={url}
                                key={name}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                {name}
                            </a>
                        ))}
                    </div>
                </div>
                <div className="border-t border-border/40 pt-6 text-center">
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} {siteConfig.name}. Built with Next.js,
                        Tailwind CSS &amp; lots of ☕
                    </p>
                </div>
            </div>
        </footer>
    );
}
