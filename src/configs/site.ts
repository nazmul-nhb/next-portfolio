import {
    Briefcase,
    Contact,
    FileText,
    FolderKanban,
    GraduationCap,
    Home,
    Info,
    LayoutDashboard,
    Lightbulb,
    MessageCircle,
    MessageSquare,
    MessageSquareQuote,
    Newspaper,
    PenTool,
    Tag,
    Users,
} from 'lucide-react';
import type { TabItem } from '@/types';

export const siteConfig = {
    name: 'Nazmul Hassan',
    description:
        'Full-Stack Web Developer passionate about building modern, performant, and accessible web applications.',
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL as string,
    navItems: [
        { title: 'Home', path: '/', icon: Home },
        { title: 'Blog', path: '/blogs', icon: PenTool },
        { title: 'Projects', path: '/projects', icon: FolderKanban },
        { title: 'About', path: '/about', icon: Info },
        { title: 'Contact', path: '/contact', icon: Contact },
        { type: 'separator' },
        { title: 'Messages', path: '/messages', icon: MessageSquare },
        { title: 'Resume', path: '/resume', icon: FileText },
        // { title: 'Settings', path: '/settings', icon: Settings },
    ] satisfies TabItem[],
    adminMenus: [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
        { href: '/admin/skills', label: 'Skills', icon: Lightbulb },
        { href: '/admin/categories', label: 'Categories', icon: Tag },
        { href: '/admin/blogs', label: 'Blogs', icon: Newspaper },
        { href: '/admin/experience', label: 'Experience', icon: Briefcase },
        { href: '/admin/education', label: 'Education', icon: GraduationCap },
        { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
        { href: '/admin/messages', label: 'Messages', icon: MessageCircle },
        { href: '/admin/users', label: 'Users', icon: Users },
    ],
    links: {
        github: 'https://github.com/nazmul-nhb',
        linkedin: 'https://linkedin.com/in/nazmul-nhb',
        discord: 'https://discord.com/users/831030314528538664',
        // twitter: 'https://twitter.com/nhb42',
    },
    tokenName: 'nhb-token',
    logoSvg: '/logo.svg',
    favicon: '/favicon.png',
    /** 1 Minute */
    staleTime: 60000,
} as const;

export type SiteConfig = typeof siteConfig;
