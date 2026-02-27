'use client';

import { pdf } from '@react-pdf/renderer';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { SiAdobeacrobatreader } from 'react-icons/si';
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
        <button
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
            disabled={downloading}
            onClick={handleDownload}
            type="button"
        >
            {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <SiAdobeacrobatreader className="h-4 w-4" style={{ color: '#EC1C24' }} />
            )}
            Download PDF
        </button>
    );
}
