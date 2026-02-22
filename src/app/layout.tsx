import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Image from 'next/image';
import { AuthSync } from '@/components/auth-sync';
import ThemeToggler from '@/components/misc/theme-toggler';
import Navbar from '@/components/nav/navbar';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { siteConfig } from '@/configs/site';
import { getCurrentYear } from '@/lib/utils';
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
    metadataBase: new URL(siteConfig.baseUrl),
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
        url: siteConfig.baseUrl,
        siteName: siteConfig.name,
        images: [
            {
                url: siteConfig.logoSvg,
                alt: `${siteConfig.name} Logo`,
                width: 1200,
                height: 630,
            },
            {
                url: siteConfig.favicon,
                alt: `${siteConfig.name} Logo`,
                width: 1200,
                height: 630,
            },
        ],
        type: 'website',
    },
};

type RootProps = Readonly<{
    children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootProps) {
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
                            <AuthSync />
                            <TooltipProvider>
                                <Navbar />
                                <main className="min-h-[calc(100vh-4rem)]">{children}</main>
                                <Footer />
                                <ThemeToggler />
                                <Toaster />
                            </TooltipProvider>
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
                        {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-violet-600 text-xs font-bold text-white">
                            NH
                        </div> */}
                        <Image
                            alt={siteConfig.name}
                            className="h-8 w-8 rounded-full object-fit"
                            height={520}
                            quality={100}
                            src={siteConfig.logoSvg}
                            width={520}
                        />
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
                        &copy; {getCurrentYear()} {siteConfig.name}.
                        <br />
                        Built with ❤️
                    </p>
                </div>
            </div>
        </footer>
    );
}
