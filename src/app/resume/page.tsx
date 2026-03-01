import { asc, desc, eq } from 'drizzle-orm';
import { Briefcase, Code2, GraduationCap, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { FiGithub, FiLinkedin } from 'react-icons/fi';
import {
    FadeInUp,
    ScaleInItem,
    SlideInLeft,
    SlideInRight,
    StaggerContainer,
} from '@/components/misc/animations';
import { DownloadResumeButton } from '@/components/misc/download-resume-button';
import { ENV } from '@/configs/env';
import { siteConfig } from '@/configs/site';
import { db } from '@/lib/drizzle';
import { education, experiences } from '@/lib/drizzle/schema/career';
import { skills } from '@/lib/drizzle/schema/skills';
import { users } from '@/lib/drizzle/schema/users';
import { buildCloudinaryUrl, formatDuration } from '@/lib/utils';
import type { SelectEducation, SelectExperience } from '@/types/career';
import type { SelectSkill } from '@/types/skills';

export const metadata: Metadata = {
    title: 'Resume',
    description: `Resume of ${siteConfig.name} - Full-Stack Web Developer.`,
    keywords: [...siteConfig.keywords],
};

/** Resume / CV page with downloadable PDF option. */
export default async function ResumePage() {
    // Fetch all data
    let allSkills: SelectSkill[] = [];
    let allExperiences: SelectExperience[] = [];
    let allEducation: SelectEducation[] = [];
    let profile: {
        name: string;
        email: string;
        profile_image?: string | null;
    } = {
        name: siteConfig.name,
        email: ENV.adminEmail,
    };

    try {
        [allSkills, allExperiences, allEducation] = await Promise.all([
            db.select().from(skills).orderBy(asc(skills.sort_order), asc(skills.title)),
            db.select().from(experiences).orderBy(desc(experiences.start_date)),
            db.select().from(education).orderBy(desc(education.start_date)),
        ]);

        // Get user data if logged in
        [profile] = await db
            .select({
                name: users.name,
                email: users.email,
                profile_image: users.profile_image,
            })
            .from(users)
            .where(eq(users.email, ENV.adminEmail))
            .limit(1);
    } catch (error) {
        console.error('Failed to fetch resume data:', error);
    }

    const summary =
        'Passionate Full-Stack Web Developer with hands-on experience building modern, performant, and accessible web applications. Proficient in TypeScript, React, Next.js, Node.js, and other web technologies. Committed to clean code, open-source contribution, and continuous learning.';

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
            {/* Header */}
            <FadeInUp>
                <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            {profile.name}
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground sm:text-lg">
                            Full-Stack Web Developer
                        </p>
                        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
                            <a
                                className="inline-flex items-center gap-1 hover:text-foreground"
                                href={`mailto:${profile.email}`}
                            >
                                <Mail className="size-3.5 shrink-0" />
                                <span className="truncate">{profile.email}</span>
                            </a>
                            <a
                                className="inline-flex items-center gap-1 hover:text-foreground"
                                href={siteConfig.links.github}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <FiGithub className="size-3.5 shrink-0" />
                                GitHub
                            </a>
                            <a
                                className="inline-flex items-center gap-1 hover:text-foreground"
                                href={siteConfig.links.linkedin}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <FiLinkedin className="size-3.5 shrink-0 mb-0.5" />
                                LinkedIn
                            </a>
                        </div>
                    </div>
                    <DownloadResumeButton
                        education={allEducation}
                        experiences={allExperiences}
                        skills={allSkills}
                        summary={summary}
                        user={profile}
                    />
                </div>
            </FadeInUp>

            <hr className="mb-8 border-border/50 sm:mb-10" />

            {/* Summary */}
            <FadeInUp>
                <section className="mb-8 sm:mb-10">
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {summary}
                    </p>
                </section>
            </FadeInUp>

            {/* Experience */}
            {allExperiences.length > 0 && (
                <section className="mb-8 sm:mb-10">
                    <SlideInLeft>
                        <div className="mb-6 flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold">Experience</h2>
                        </div>
                    </SlideInLeft>

                    <StaggerContainer className="space-y-8">
                        {allExperiences.map((exp) => (
                            <ScaleInItem key={exp.id}>
                                <div>
                                    <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                        <div>
                                            <h3 className="font-semibold">{exp.position}</h3>
                                            <p className="text-sm text-primary">
                                                {exp.company}
                                                {exp.location && ` • ${exp.location}`}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {formatDuration(exp.start_date, exp.end_date)}
                                        </span>
                                    </div>
                                    <p className="border-l-8 border-l-secondary pl-2 mt-2 text-sm text-muted-foreground">
                                        {exp.description}
                                    </p>
                                    {exp.achievements.length > 0 && (
                                        <ul className="mt-2 space-y-1">
                                            {exp.achievements.map((achievement, idx) => (
                                                <li
                                                    className="text-sm text-muted-foreground before:mr-2 before:text-primary before:content-['▸']"
                                                    key={idx}
                                                >
                                                    {achievement}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {exp.technologies.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {exp.technologies.map((tech, idx) => (
                                                <span
                                                    className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary"
                                                    key={idx}
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </ScaleInItem>
                        ))}
                    </StaggerContainer>
                </section>
            )}

            {/* Education */}
            {allEducation.length > 0 && (
                <section className="mb-8 sm:mb-10">
                    <SlideInRight>
                        <div className="mb-6 flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold">Education</h2>
                        </div>
                    </SlideInRight>

                    <StaggerContainer className="space-y-6">
                        {allEducation.map((edu) => (
                            <ScaleInItem key={edu.id}>
                                <div>
                                    <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                        <div>
                                            <h3 className="font-semibold">{edu.degree}</h3>
                                            <p className="text-sm text-primary">
                                                {edu.institution}
                                                {edu.location && ` • ${edu.location}`}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {formatDuration(edu.start_date, edu.end_date)}
                                        </span>
                                    </div>
                                    {edu.grade && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Grade: {edu.grade}
                                        </p>
                                    )}
                                    {edu.description && (
                                        <p className="border-l-8 border-l-secondary pl-2 mt-1 text-sm text-muted-foreground">
                                            {edu.description}
                                        </p>
                                    )}
                                    {edu.achievements && edu.achievements.length > 0 && (
                                        <ul className="mt-2 space-y-1">
                                            {edu.achievements.map((achievement, idx) => (
                                                <li
                                                    className="text-sm text-muted-foreground before:mr-2 before:text-primary before:content-['▸']"
                                                    key={idx}
                                                >
                                                    {achievement}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </ScaleInItem>
                        ))}
                    </StaggerContainer>
                </section>
            )}

            {/* Skills */}
            {allSkills.length > 0 && (
                <section className="mb-8 sm:mb-10">
                    <SlideInLeft>
                        <div className="mb-6 flex items-center gap-2">
                            <Code2 className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold">Technical Skills</h2>
                        </div>
                    </SlideInLeft>

                    <FadeInUp>
                        <div className="flex flex-wrap gap-2">
                            {allSkills.map((skill) => (
                                <span
                                    className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted px-2.5 py-1 text-xs font-medium"
                                    key={skill.id}
                                >
                                    <Image
                                        alt={skill.title}
                                        className="size-3.5 object-contain"
                                        height={14}
                                        loading="eager"
                                        src={buildCloudinaryUrl(skill.icon)}
                                        width={14}
                                    />
                                    {skill.title}
                                </span>
                            ))}
                        </div>
                    </FadeInUp>
                </section>
            )}
        </div>
    );
}
