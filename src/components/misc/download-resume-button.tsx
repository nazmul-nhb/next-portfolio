'use client';

import { pdf } from '@react-pdf/renderer';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { SiAdobeacrobatreader, SiGoogledrive } from 'react-icons/si';
import { siteConfig } from '@/configs/site';
import { cn } from '@/lib/utils';
import { ResumePDF } from './resume-pdf';

interface Experience {
    id: number;
    position: string;
    company: string;
    location: string | null;
    start_date: string;
    end_date: string | null;
    description: string;
    technologies: string[];
    achievements: string[];
}

interface Education {
    id: number;
    degree: string;
    institution: string;
    location: string | null;
    start_date: string;
    end_date: string | null;
    grade: string | null;
    description: string | null;
    achievements: string[] | null;
}

interface Skill {
    id: number;
    title: string;
    icon: string;
}

interface User {
    name: string;
    email: string;
    profile_image?: string | null;
}

interface DownloadButtonProps {
    user: User;
    experiences: Experience[];
    education: Education[];
    skills: Skill[];
    summary?: string;
}

export function DownloadResumeButton({
    user,
    experiences,
    education,
    skills,
    summary,
}: DownloadButtonProps) {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const blob = await pdf(
                <ResumePDF
                    data={{
                        user,
                        experiences,
                        education,
                        skills,
                        summary,
                    }}
                />
            ).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${user.name.replace(/\s+/g, '_')}_Resume.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <button
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-100/75 px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-200/75 disabled:opacity-50 dark:border-red-800/50 dark:bg-red-600/10 dark:text-red-400 dark:hover:bg-red-900/40"
                disabled={downloading}
                onClick={handleDownload}
                type="button"
            >
                <SiAdobeacrobatreader
                    className={cn('size-4', { 'animate-spin': downloading })}
                    style={{ color: '#EC1C24' }}
                />
                Download This Page
            </button>
            <a
                className="group inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-linear-to-r from-blue-50 to-sky-50 px-4 py-2 text-sm font-medium text-blue-600 shadow-sm transition-all hover:from-blue-100 hover:to-sky-100 hover:shadow-md dark:border-blue-800/50 dark:from-blue-600/10 dark:to-sky-600/10 dark:text-blue-400 dark:hover:from-blue-900/30 dark:hover:to-sky-900/30"
                href={siteConfig.resumeLink}
                rel="noopener noreferrer"
                target="_blank"
            >
                <SiGoogledrive className="size-4 text-[#4285F4]" />
                Download from Drive
                <ExternalLink className="size-3 opacity-50 transition-opacity group-hover:opacity-100" />
            </a>
        </div>
    );
}
