import './globals.css';

import type { Metadata } from 'next';
import { AuthSync } from '@/components/auth-sync';
import DateTimeCalendar from '@/components/misc/datetime-calendar';
import Footer from '@/components/misc/footer';
import ThemeToggler from '@/components/misc/theme-toggler';
import Navbar from '@/components/nav/navbar';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { siteConfig } from '@/configs/site';
import { anekBangla, geistMono, geistSans, sourceSans, tiroBangla } from '@/lib/fonts';
import { buildOpenGraphImages, cn } from '@/lib/utils';
import { AuthProvider } from '@/providers/auth-provider';
import { ReactQueryProvider } from '@/providers/query-provider';
import { NextThemesProvider } from '@/providers/theme-provider';

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s » ${siteConfig.name}`,
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
    authors: [{ name: siteConfig.name, url: siteConfig.baseUrl }],
    icons: {
        icon: siteConfig.favicon,
        shortcut: siteConfig.favicon,
    },
    openGraph: {
        title: {
            default: siteConfig.name,
            template: `%s » ${siteConfig.name}`,
        },
        description: siteConfig.description,
        url: siteConfig.baseUrl,
        siteName: siteConfig.name,
        images: buildOpenGraphImages(siteConfig.logoSvg, siteConfig.favicon),
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.name,
        description: siteConfig.description,
        images: buildOpenGraphImages(siteConfig.logoSvg, siteConfig.favicon),
        creator: '@nhb42',
    },
};

type RootProps = Readonly<{
    children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <link href="/favicon.png" rel="shortcut icon" type="image/png" />
            <body
                className={cn(
                    geistSans.variable,
                    sourceSans.variable,
                    geistMono.variable,
                    tiroBangla.variable,
                    anekBangla.variable,
                    'antialiased'
                )}
                suppressHydrationWarning
            >
                <AuthProvider>
                    <ReactQueryProvider>
                        <NextThemesProvider
                            attribute="class"
                            defaultTheme="dark"
                            themes={['dark', 'light']}
                        >
                            <TooltipProvider>
                                <AuthSync />
                                <Navbar />
                                <main className="min-h-[calc(100vh-4rem)]">{children}</main>
                                <Footer />
                                <DateTimeCalendar />
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
