import { Contact, Home, PenTool, Settings } from 'lucide-react';
import type { TabItem } from '@/components/ui/doc-tabs';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: 'Nazmul Hassan',
    description: 'Personal Website of Nazmul Hassan',
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    navItems: [
        { title: 'Home', path: '/', icon: Home },
        { title: 'Contact', path: '/contact', icon: Contact },
        { title: 'Blog', path: '/blogs', icon: PenTool },
        { type: 'separator' },
        { title: 'Settings', path: '/settings', icon: Settings },
    ] satisfies TabItem[],
    links: {
        github: 'https://github.com/nazmul-nhb',
        discord: 'https://discord.com/users/831030314528538664',
    },
    tokenName: 'nhb-token',
};
