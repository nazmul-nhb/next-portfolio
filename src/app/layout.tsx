import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Navbar from '@/components/navbar';
import ThemeToggler from '@/components/theme-toggler';
import { Toaster } from '@/components/ui/sonner';
import { siteConfig } from '@/configs/site';
import { AuthProvider } from '@/providers/auth-provider';
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
                </AuthProvider>
            </body>
        </html>
    );
}

/** Site footer with links and copyright. */
function Footer() {
    return (
        <footer className="border-t border-border bg-background/80 backdrop-blur-sm">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
                        reserved.
                    </p>
                    <div className="flex gap-4">
                        {Object.entries(siteConfig.links).map(([name, url]) => (
                            <a
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground capitalize"
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
            </div>
        </footer>
    );
}
