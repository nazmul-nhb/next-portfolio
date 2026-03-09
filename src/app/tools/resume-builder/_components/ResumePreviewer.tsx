'use client';

import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import { memo } from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Card } from '@/components/ui/card';
import { DEFAULT_SECTION_LABELS } from '@/lib/resume-builder/defaults';
import type { ResumeConfig } from '@/lib/resume-builder/types';

interface ResumePreviwerProps {
    config: ResumeConfig;
    onImageChange?: (patch: Partial<ResumeConfig['header']['image']>) => void;
}

/**
 * Resume preview component with real-time editing
 */
const ResumePrevier = memo(function ResumePreviewer({ config }: ResumePreviwerProps) {
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const sortedSections = config.sections
        .filter((s) => s.enabled)
        .sort((a, b) => a.order - b.order);

    return (
        <Card
            className="custom-scroll overflow-y-auto border xl:sticky xl:top-20 rounded-none bg-transparent max-h-fit p-0"
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="w-full flex justify-center">
                <div
                    className="w-full bg-white dark:bg-slate-950 shadow-lg"
                    style={{
                        maxWidth: '850px',
                        fontFamily: config.fontFamily,
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#1f2937',
                    }}
                >
                    {/* Header Section */}
                    <div
                        className="p-6 border-b bg-linear-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
                        style={{ fontFamily: config.sectionFonts.summary }}
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <h1
                                    className="text-3xl font-bold mb-1"
                                    style={{ fontFamily: config.fontFamily }}
                                >
                                    {config.header.fullName}
                                </h1>
                                <p className="text-lg text-slate-600 dark:text-slate-400 mb-3">
                                    {config.header.jobTitle}
                                </p>

                                {/* Contact Information */}
                                <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
                                    {config.header.email && (
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            <a
                                                className="hover:text-primary"
                                                href={`mailto:${config.header.email}`}
                                            >
                                                {config.header.email}
                                            </a>
                                        </div>
                                    )}
                                    {config.header.phone && (
                                        <div className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {config.header.phone}
                                        </div>
                                    )}
                                    {config.header.location && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {config.header.location}
                                        </div>
                                    )}
                                    {config.header.website && (
                                        <div className="flex items-center gap-1">
                                            <Globe className="w-3 h-3" />
                                            <a
                                                className="hover:text-primary"
                                                href={config.header.website}
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >
                                                {config.header.website
                                                    .replace('https://', '')
                                                    .replace('http://', '')}
                                            </a>
                                        </div>
                                    )}
                                    {config.header.linkedin && (
                                        <div className="flex items-center gap-1">
                                            <FaLinkedin className="w-3 h-3" />
                                            {config.header.linkedin}
                                        </div>
                                    )}
                                    {config.header.github && (
                                        <div className="flex items-center gap-1">
                                            <FaGithub className="w-3 h-3" />
                                            {config.header.github}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Profile Image */}
                            {config.header.image && (
                                <div className="shrink-0">
                                    <Image
                                        alt="Profile"
                                        className="w-24 h-24 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                                        height={96}
                                        src={config.header.image.dataUrl}
                                        width={96}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className="p-6 space-y-5">
                        {sortedSections.map((section) => {
                            if (section.id === 'summary') {
                                return (
                                    <section
                                        key="summary"
                                        style={{ fontFamily: config.sectionFonts.summary }}
                                    >
                                        <h2 className="text-lg font-bold mb-2 text-slate-900 dark:text-white border-b pb-1">
                                            {DEFAULT_SECTION_LABELS.summary}
                                        </h2>
                                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                            {config.summary}
                                        </p>
                                    </section>
                                );
                            }

                            if (section.id === 'skills') {
                                return (
                                    <section
                                        key="skills"
                                        style={{ fontFamily: config.sectionFonts.skills }}
                                    >
                                        <h2 className="text-lg font-bold mb-2 text-slate-900 dark:text-white border-b pb-1">
                                            {DEFAULT_SECTION_LABELS.skills}
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {config.skills.map((skill) => (
                                                <span
                                                    className="px-3 py-1 bg-primary/10 text-primary dark:bg-primary/20 rounded-full text-xs font-medium"
                                                    key={skill.id}
                                                >
                                                    {skill.name}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                );
                            }

                            if (section.id === 'experience') {
                                return (
                                    <section
                                        key="experience"
                                        style={{ fontFamily: config.sectionFonts.experience }}
                                    >
                                        <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white border-b pb-1">
                                            {DEFAULT_SECTION_LABELS.experience}
                                        </h2>
                                        <div className="space-y-4">
                                            {config.experience.map((exp) => (
                                                <div
                                                    className="border-l-2 border-primary pl-4"
                                                    key={exp.id}
                                                >
                                                    <div className="flex justify-between items-baseline gap-2">
                                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                                            {exp.position}
                                                        </h3>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                            {exp.startDate}
                                                            {exp.current
                                                                ? ' - Present'
                                                                : ` - ${exp.endDate}`}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                                        {exp.company}
                                                    </p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                                        {exp.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                );
                            }

                            if (section.id === 'education') {
                                return (
                                    <section
                                        key="education"
                                        style={{ fontFamily: config.sectionFonts.education }}
                                    >
                                        <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white border-b pb-1">
                                            {DEFAULT_SECTION_LABELS.education}
                                        </h2>
                                        <div className="space-y-4">
                                            {config.education.map((edu) => (
                                                <div
                                                    className="border-l-2 border-primary pl-4"
                                                    key={edu.id}
                                                >
                                                    <div className="flex justify-between items-baseline gap-2">
                                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                                            {edu.degree} in {edu.field}
                                                        </h3>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                            {edu.startDate}
                                                            {edu.current
                                                                ? ' - Present'
                                                                : ` - ${edu.endDate}`}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                                        {edu.school}
                                                    </p>
                                                    {edu.description && (
                                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                                            {edu.description}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                );
                            }

                            return null;
                        })}

                        {/* Custom Sections */}
                        {config.customSections.map((customSection) => (
                            <section className="border-t pt-4" key={customSection.id}>
                                <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white border-b pb-1">
                                    {customSection.title}
                                </h2>

                                {customSection.fieldType === 'textarea' &&
                                    typeof customSection.value === 'string' && (
                                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                            {customSection.value}
                                        </p>
                                    )}

                                {customSection.fieldType === 'text' &&
                                    typeof customSection.value === 'string' && (
                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                            {customSection.value}
                                        </p>
                                    )}

                                {customSection.fieldType === 'list' &&
                                    Array.isArray(customSection.value) && (
                                        <ul className="space-y-2">
                                            {customSection.value.map((item) => (
                                                <li
                                                    className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2"
                                                    key={item.id}
                                                >
                                                    <span className="font-bold mt-0.5">•</span>
                                                    <span>{item.value}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
});

export default ResumePrevier;
