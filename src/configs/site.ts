import {
    Contact,
    FileText,
    FolderKanban,
    Home,
    Info,
    MessageSquare,
    PenTool,
    Settings,
} from 'lucide-react';
import type { TabItem } from '@/components/ui/doc-tabs';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: 'Nazmul Hassan',
    description:
        'Full-Stack Web Developer passionate about building modern, performant, and accessible web applications.',
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    navItems: [
        { title: 'Home', path: '/', icon: Home },
        { title: 'Blog', path: '/blogs', icon: PenTool },
        { title: 'Projects', path: '/projects', icon: FolderKanban },
        { title: 'About', path: '/about', icon: Info },
        { title: 'Contact', path: '/contact', icon: Contact },
        { type: 'separator' },
        { title: 'Messages', path: '/messages', icon: MessageSquare },
        { title: 'Resume', path: '/resume', icon: FileText },
        { title: 'Settings', path: '/settings', icon: Settings },
    ] satisfies TabItem[],
    links: {
        github: 'https://github.com/nazmul-nhb',
        linkedin: 'https://linkedin.com/in/nazmul-nhb',
        discord: 'https://discord.com/users/831030314528538664',
        twitter: 'https://twitter.com/nazmul_nhb',
    },
    tokenName: 'nhb-token',
    skills: [
        'TypeScript',
        'JavaScript',
        'React',
        'Next.js',
        'Node.js',
        'Express.js',
        'PostgreSQL',
        'MongoDB',
        'Tailwind CSS',
        'Drizzle ORM',
        'Prisma',
        'GraphQL',
        'REST APIs',
        'Docker',
        'Git',
        'AWS',
    ],
} as const;
