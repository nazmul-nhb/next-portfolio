import './globals.css';
import 'react-photo-view/dist/react-photo-view.css';

import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';
import Footer from '@/components/footer/footer';
import { AuthSync } from '@/components/misc/auth-sync';
import ChatBubble from '@/components/misc/chat-bubble';
import DateTimeCalendar from '@/components/misc/datetime-calendar';
import ThemeToggler from '@/components/misc/theme-toggler';
import Navbar from '@/components/nav/navbar';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ENV } from '@/configs/env';
import { siteConfig } from '@/configs/site';
import {
    anekBangla,
    cascadiaCode,
    geistMono,
    geistSans,
    sourceSans,
    tiroBangla,
} from '@/lib/fonts';
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
    keywords: [...siteConfig.keywords, ...Object.values(siteConfig.links)],
    authors: [{ name: siteConfig.name, url: siteConfig.baseUrl }],
    alternates: { canonical: new URL(siteConfig.baseUrl) },
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
        images: buildOpenGraphImages(siteConfig.favicon, siteConfig.logoSvg),
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: {
            default: siteConfig.name,
            template: `%s » ${siteConfig.name}`,
        },
        description: siteConfig.description,
        images: buildOpenGraphImages(siteConfig.favicon, siteConfig.logoSvg),
        creator: '@nhb42',
    },
    verification: {
        google: ENV.google.gscVerificationId,
    },
};

type RootProps = Readonly<{
    children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <link href={siteConfig.favicon} rel="shortcut icon" type="image/png" />
            <body
                className={cn(
                    geistSans.variable,
                    sourceSans.variable,
                    geistMono.variable,
                    cascadiaCode.variable,
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
                                <NextTopLoader
                                    color="#4682B4"
                                    height={3}
                                    showSpinner={false}
                                    zIndex={9999}
                                />
                                <SpeedInsights />
                                <Analytics />
                                <AuthSync />
                                <Navbar />
                                <main className="min-h-[calc(100vh-4rem)]">{children}</main>
                                <Footer />
                                <ChatBubble />
                                <DateTimeCalendar />
                                <ThemeToggler />
                                <Toaster />
                            </TooltipProvider>
                        </NextThemesProvider>
                    </ReactQueryProvider>
                </AuthProvider>
            </body>
            <GoogleAnalytics gaId={ENV.google.analyticsId} />
        </html>
    );
}
