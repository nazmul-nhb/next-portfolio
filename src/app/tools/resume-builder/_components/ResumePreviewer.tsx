'use client';

import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import { isString } from 'nhb-toolbox';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Card } from '@/components/ui/card';
import { DEFAULT_SECTION_LABELS } from '@/lib/resume-builder/defaults';
import type { ResumeConfig } from '@/lib/resume-builder/types';
import {
    formatResumeDateRange,
    formatResumeLinkLabel,
    normalizeResumeHref,
    sortResumeSections,
} from '@/lib/resume-builder/utils';

interface ResumePreviewerProps {
    config: ResumeConfig;
}

export default function ResumePreviewer({ config }: ResumePreviewerProps) {
    const sortedSections = sortResumeSections(config.sections).filter(
        (section) => section.enabled
    );

    return (
        <Card className="custom-scroll max-h-fit overflow-y-auto rounded-none border border-sky-200/60 bg-linear-to-br from-sky-50 via-blue-50/70 to-background p-3 shadow-sm">
            <div className="mx-auto w-full max-w-212.5 border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <div
                    className="border-b border-slate-200 bg-linear-to-r from-sky-50 via-white to-slate-50 p-7"
                    style={{ fontFamily: config.sectionFonts.summary }}
                >
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                                <h1
                                    className="text-4xl font-bold tracking-tight text-slate-950"
                                    style={{ fontFamily: config.fontFamily }}
                                >
                                    {config.header.fullName}
                                </h1>
                                <p className="text-base font-medium text-slate-600">
                                    {config.header.jobTitle}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-slate-600">
                                {config.header.email ? (
                                    <a
                                        className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-950"
                                        href={`mailto:${config.header.email}`}
                                    >
                                        <Mail className="size-3.5" />
                                        {config.header.email}
                                    </a>
                                ) : null}
                                {config.header.phone ? (
                                    <a
                                        className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-950"
                                        href={`tel:${config.header.phone}`}
                                    >
                                        <Phone className="size-3.5" />
                                        {config.header.phone}
                                    </a>
                                ) : null}
                                {config.header.location ? (
                                    <span className="inline-flex items-center gap-1.5">
                                        <MapPin className="size-3.5" />
                                        {config.header.location}
                                    </span>
                                ) : null}
                                {config.header.website ? (
                                    <a
                                        className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-950"
                                        href={normalizeResumeHref(config.header.website)}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <Globe className="size-3.5" />
                                        {formatResumeLinkLabel(config.header.website)}
                                    </a>
                                ) : null}
                                {config.header.linkedin ? (
                                    <a
                                        className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-950"
                                        href={normalizeResumeHref(config.header.linkedin)}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <FaLinkedin className="size-3.5" />
                                        {formatResumeLinkLabel(config.header.linkedin)}
                                    </a>
                                ) : null}
                                {config.header.github ? (
                                    <a
                                        className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-950"
                                        href={normalizeResumeHref(config.header.github)}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <FaGithub className="size-3.5" />
                                        {formatResumeLinkLabel(config.header.github)}
                                    </a>
                                ) : null}
                            </div>
                        </div>

                        {config.header.image?.dataUrl ? (
                            <div className="shrink-0">
                                <Image
                                    alt="Profile"
                                    className="size-24 rounded-2xl border border-slate-200 object-cover shadow-sm"
                                    height={96}
                                    src={config.header.image.dataUrl}
                                    width={96}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="space-y-6 p-7 text-[13px] leading-6 text-slate-700">
                    {sortedSections.map((section) => {
                        if (section.id === 'summary' && config.summary.trim()) {
                            return (
                                <section
                                    className="space-y-3"
                                    key={section.id}
                                    style={{ fontFamily: config.sectionFonts.summary }}
                                >
                                    <h2 className="border-b border-slate-200 pb-2 text-xs font-semibold tracking-[0.24em] text-slate-900 uppercase">
                                        {DEFAULT_SECTION_LABELS.summary}
                                    </h2>
                                    <p className="leading-6 text-slate-700">{config.summary}</p>
                                </section>
                            );
                        }

                        if (section.id === 'skills' && config.skills.length > 0) {
                            return (
                                <section
                                    className="space-y-3"
                                    key={section.id}
                                    style={{ fontFamily: config.sectionFonts.skills }}
                                >
                                    <h2 className="border-b border-slate-200 pb-2 text-xs font-semibold tracking-[0.24em] text-slate-900 uppercase">
                                        {DEFAULT_SECTION_LABELS.skills}
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-xs font-medium text-slate-800">
                                            {config.skills
                                                .map((skill) => skill.name)
                                                .join(', ')}
                                        </span>
                                    </div>
                                </section>
                            );
                        }

                        if (section.id === 'experience' && config.experience.length > 0) {
                            return (
                                <section
                                    className="space-y-4"
                                    key={section.id}
                                    style={{ fontFamily: config.sectionFonts.experience }}
                                >
                                    <h2 className="border-b border-slate-200 pb-2 text-xs font-semibold tracking-[0.24em] text-slate-900 uppercase">
                                        {DEFAULT_SECTION_LABELS.experience}
                                    </h2>
                                    {config.experience.map((experience) => (
                                        <div
                                            className="border-l-2 border-slate-200 pl-4"
                                            key={experience.id}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <h3 className="text-sm font-semibold text-slate-950">
                                                        {experience.position}
                                                    </h3>
                                                    <p className="text-sm font-medium text-slate-600">
                                                        {experience.company}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 text-xs font-medium text-slate-500">
                                                    {formatResumeDateRange(
                                                        experience.startDate,
                                                        experience.endDate,
                                                        experience.current
                                                    )}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-slate-700">
                                                {experience.description}
                                            </p>
                                        </div>
                                    ))}
                                </section>
                            );
                        }

                        if (section.id === 'education' && config.education.length > 0) {
                            return (
                                <section
                                    className="space-y-4"
                                    key={section.id}
                                    style={{ fontFamily: config.sectionFonts.education }}
                                >
                                    <h2 className="border-b border-slate-200 pb-2 text-xs font-semibold tracking-[0.24em] text-slate-900 uppercase">
                                        {DEFAULT_SECTION_LABELS.education}
                                    </h2>
                                    {config.education.map((education) => (
                                        <div
                                            className="border-l-2 border-slate-200 pl-4"
                                            key={education.id}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <h3 className="text-sm font-semibold text-slate-950">
                                                        {education.degree}
                                                        {education.field
                                                            ? ` in ${education.field}`
                                                            : ''}
                                                    </h3>
                                                    <p className="text-sm font-medium text-slate-600">
                                                        {education.school}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 text-xs font-medium text-slate-500">
                                                    {formatResumeDateRange(
                                                        education.startDate,
                                                        education.endDate,
                                                        education.current
                                                    )}
                                                </span>
                                            </div>
                                            {education.description ? (
                                                <p className="mt-2 text-sm leading-6 text-slate-700">
                                                    {education.description}
                                                </p>
                                            ) : null}
                                        </div>
                                    ))}
                                </section>
                            );
                        }

                        return null;
                    })}

                    {config.customSections.map((section) => {
                        if (section.fieldType !== 'list' && isString(section.value)) {
                            if (!section.value.trim()) {
                                return null;
                            }

                            return (
                                <section className="space-y-3" key={section.id}>
                                    <h2 className="border-b border-slate-200 pb-2 text-xs font-semibold tracking-[0.24em] text-slate-900 uppercase">
                                        {section.title}
                                    </h2>
                                    <p
                                        className={
                                            section.fieldType === 'textarea'
                                                ? 'whitespace-pre-wrap leading-6 text-slate-700'
                                                : 'leading-6 text-slate-700'
                                        }
                                    >
                                        {section.value}
                                    </p>
                                </section>
                            );
                        }

                        if (section.fieldType === 'list' && Array.isArray(section.value)) {
                            if (section.value.length === 0) {
                                return null;
                            }

                            return (
                                <section className="space-y-3" key={section.id}>
                                    <h2 className="border-b border-slate-200 pb-2 text-xs font-semibold tracking-[0.24em] text-slate-900 uppercase">
                                        {section.title}
                                    </h2>
                                    <ul className="space-y-2">
                                        {section.value.map((item) => (
                                            <li
                                                className="flex items-start gap-2 text-sm leading-6 text-slate-700"
                                                key={item.id}
                                            >
                                                <span className="mt-0.5 text-slate-400">•</span>
                                                <span>{item.value}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            );
                        }

                        return null;
                    })}
                </div>
            </div>
        </Card>
    );
}
