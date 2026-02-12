'use client';

import { pdf } from '@react-pdf/renderer';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
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
}

export function DownloadResumeButton({
    user,
    experiences,
    education,
    skills,
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
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            disabled={downloading}
            onClick={handleDownload}
            type="button"
        >
            {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            Download PDF
        </button>
    );
}
