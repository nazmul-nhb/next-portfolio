import {
    Binary,
    Briefcase,
    Calculator,
    Contact,
    FileText,
    FileUser,
    FolderKanban,
    Globe,
    GraduationCap,
    Home,
    ImagePlus,
    Info,
    LayoutDashboard,
    Lightbulb,
    MessageCircle,
    MessageSquare,
    MessageSquareLock,
    MessageSquareQuote,
    Newspaper,
    PenTool,
    Tag,
    Users,
    Wallet,
    WholeWord,
    ZodiacCapricorn,
} from 'lucide-react';
import type { Route } from 'next';
import type { ComponentType } from 'react';
import { FaDiscord, FaTools, FaWhatsapp } from 'react-icons/fa';
import { FiGithub, FiLinkedin } from 'react-icons/fi';
import { ImNpm } from 'react-icons/im';
import type { TabItem } from '@/types';

export const siteConfig = {
    name: 'Nazmul Hassan',
    description:
        'Programmer, Full-Stack Web Developer passionate about building modern, performant, and accessible web applications.',
    keywords: [
        'web developer',
        'portfolio',
        'blog',
        'nazmul hassan',
        'full-stack developer',
        'next.js',
        'react',
        'node.js',
        'typescript',
        'javascript',
        'software engineer',
        'programming',
        'technology',
        'personal website',
        'career highlights',
        'projects',
        'testimonials',
        'skills',
        'contact',
        'open source',
        'tech blog',
        'developer portfolio',
        'coding',
        'software development',
        'web development',
        'programming tutorials',
        'tech insights',
        'tools',
        'productivity',
        'productivity tools',
    ],
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL as string,
    resumeLink: process.env.NEXT_PUBLIC_RESUME_PDF_URL as string,
    navItems: [
        { title: 'Home', path: '/', icon: Home },
        { title: 'Blogs', path: '/blogs', icon: PenTool },
        { title: 'Projects', path: '/projects', icon: FolderKanban },
        { title: 'About', path: '/about', icon: Info },
        { title: 'Contact', path: '/contact', icon: Contact },
        { type: 'separator' },
        { title: 'Messages', path: '/messages', icon: MessageSquare },
        { title: 'Tools', path: '/tools', icon: FaTools },
        { title: 'Resume', path: '/resume', icon: FileText },
        // { title: 'Settings', path: '/settings', icon: Settings },
    ] satisfies TabItem[],
    toolsMenus: [
        {
            href: '/tools/age-calculator',
            label: 'Age Calculator',
            icon: Calculator,
            description:
                'Calculate age based on birthdate, with options for detailed breakdown and future age prediction.',
        },
        {
            href: '/tools/time-difference',
            label: 'Time Difference',
            icon: Calculator,
            description: 'Calculate precise differences between two moments in any time unit.',
        },
        {
            href: '/tools/timezone-converter',
            label: 'Timezone Converter',
            icon: Globe,
            description:
                'Compare current time across multiple timezones with live updates and IANA support.',
        },
        {
            href: '/tools/word-counter',
            label: 'Word Counter',
            icon: WholeWord,
            description:
                'Analyze your text with detailed word, character, and readability metrics.',
        },
        {
            href: '/tools/zodiac-sign',
            label: 'Zodiac Sign Finder',
            icon: ZodiacCapricorn,
            description:
                'Find a matching zodiac sign from a birth date using western or vedic presets.',
        },
        {
            href: '/tools/base-conversions',
            label: 'Base Conversions',
            icon: Binary,
            description:
                'Provides UTF-8–safe conversions between text, hex, binary, and Base64 representations.',
        },
        {
            href: '/tools/encrypt-message',
            label: 'Encrypt Message',
            icon: MessageSquareLock,
            description:
                'Encrypt/decrypt text using a passphrase. Must use same passphrase for reverse process.',
        },
        {
            href: '/tools/uuid',
            label: 'UUID Tools',
            icon: Tag,
            description:
                'Generate UUIDs across all RFC 4122 versions and decode existing UUIDs to inspect their structure.',
        },
        {
            href: '/tools/npm-package',
            label: 'Package Details',
            icon: ImNpm,
            description:
                'Search for npm package(s) and view comprehensive details including downloads and maintainers.',
        },
        {
            href: '/tools/resume-builder',
            label: 'Resume Builder',
            icon: FileUser,
            description:
                'Create and manage professional resume with live preview, customizable fonts, and more.',
        },
        {
            href: '/tools/photo-card',
            label: 'Photo Cards',
            icon: ImagePlus,
            description:
                'Create polished photo cards with layered images, custom typography, live preview, and more.',
        },
        {
            href: '/tools/expense-manager',
            label: 'Expense Manager',
            icon: Wallet,
            description: 'Track income, expenses, loans, repayments, and net cash in hand.',
        },
    ] satisfies Array<{ href: Route; label: string; icon: ComponentType; description: string }>,
    adminMenus: [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
        { href: '/admin/skills', label: 'Skills', icon: Lightbulb },
        { href: '/admin/experience', label: 'Experience', icon: Briefcase },
        { href: '/admin/education', label: 'Education', icon: GraduationCap },
        { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
        { href: '/admin/messages', label: 'Messages', icon: MessageCircle },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/blogs', label: 'Blogs', icon: Newspaper },
        { href: '/admin/categories', label: 'Categories', icon: Tag },
    ],
    links: {
        GitHub: 'https://github.com/nazmul-nhb',
        LinkedIn: 'https://linkedin.com/in/nazmul-nhb',
        Discord: 'https://discord.com/users/831030314528538664',
        WhatsApp: 'https://wa.me/8801623732187',
    },
    mobile: '+8801623732187',
    tokenName: 'nhb-token',
    logoSvg: '/logo.svg',
    blogCover: '/default_blog_cover.png',
    favicon: '/favicon.png',
    /** 1 Minute in MS */
    staleTime: 60000,
    userRoles: ['admin', 'user'],
} as const;

export const SOCIAL_LINKS = [
    {
        Icon: FiGithub,
        href: siteConfig.links.GitHub,
        label: 'GitHub',
    },
    {
        Icon: FiLinkedin,
        href: siteConfig.links.LinkedIn,
        label: 'LinkedIn',
    },
    {
        Icon: FaWhatsapp,
        href: siteConfig.links.WhatsApp,
        label: 'WhatsApp',
    },
    {
        Icon: FaDiscord,
        href: siteConfig.links.Discord,
        label: 'Discord',
    },
] as const;

export type SiteConfig = typeof siteConfig;
