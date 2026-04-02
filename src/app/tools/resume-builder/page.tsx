import { FileText } from 'lucide-react';
import type { Metadata } from 'next';
import { PoweredBy } from '@/app/tools/_components/PoweredBy';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import SmartAlert from '@/components/misc/smart-alert';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import ResumeBuilder from './_components/ResumeBuilder';

const description =
    'Create, edit, and manage multiple professional resumes with live preview, customizable fonts, sections, and local IndexedDB storage.';

export const metadata: Metadata = {
    title: 'Resume Builder',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'resume builder',
        'resume generator',
        'professional resume',
        'resume editor',
        'resume maker',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/resume-builder') },
    openGraph: {
        title: `Resume Builder from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/resume-builder'),
        siteName: siteConfig.name,
    },
};

export default function ResumeBuilderPage() {
    return (
        <div className="space-y-8 max-w-full">
            <TitleWithShare
                description="Build professional resumes with live preview, customizable fonts, sections, and more. Create and save multiple resume versions effortlessly."
                route={'/tools/resume-builder'}
                title="Resume Builder"
            />

            <SmartAlert
                className="border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100"
                description={
                    <ul className="ml-5 list-disc space-y-1">
                        <li>
                            Customize your profile header with name, title, contact information,
                            and a profile picture.
                        </li>
                        <li>
                            Edit default sections (summary, skills, experience, education) or
                            disable and reorder them.
                        </li>
                        <li>
                            Choose fonts globally or customize fonts for individual sections to
                            match your style.
                        </li>
                        <li>
                            Create custom sections with text, textarea, or list field types for
                            additional information.
                        </li>
                        <li>
                            See live preview of your resume as you edit. All changes appear
                            instantly.
                        </li>
                        <li>
                            Save multiple resume versions to IndexedDB locally. Load, update, or
                            delete them anytime.
                        </li>
                    </ul>
                }
                title="How it works"
            />

            <ResumeBuilder />

            <SmartAlert
                className="bg-emerald-600/10"
                description="Your resume data is saved locally in your browser's IndexedDB. Nothing is sent to any server. You have full control over your data."
                Icon={FileText}
            />

            <PoweredBy
                description="This tool uses `Locality` class from `locality-idb` to handle `IndexedDB` operations efficiently."
                name="locality-idb"
                url="https://github.com/nazmul-nhb/locality-idb?tab=readme-ov-file"
            />
        </div>
    );
}
