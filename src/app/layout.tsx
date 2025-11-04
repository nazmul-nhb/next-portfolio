import './globals.css';

import Navbar from '@/components/navbar';
import ThemeToggler from '@/components/theme-toggler';
import { NextThemesProvider } from '@/providers/theme-provider';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Nazmul Hassan',
	description: "Nazmul Hassan's Personal Website",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<NextThemesProvider
					themes={['dark', 'light']}
					attribute="class"
					defaultTheme="dark"
				>
					<Navbar />
					{children}
					<ThemeToggler />
				</NextThemesProvider>
			</body>
		</html>
	);
}
