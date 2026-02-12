import {
    Briefcase,
    Code2,
    Download,
    Github,
    GraduationCap,
    Linkedin,
    Mail,
} from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import {
    FadeInUp,
    ScaleInItem,
    SlideInLeft,
    SlideInRight,
    StaggerContainer,
} from '@/components/animations';
import { siteConfig } from '@/configs/site';
import { db } from '@/lib/drizzle';
import { skills } from '@/lib/drizzle/schema/skills';

export const metadata: Metadata = {
    title: 'Resume',
    description: 'Resume of Nazmul Hassan - Full-Stack Web Developer.',
};

const experience = [
    {
        title: 'Full-Stack Web Developer',
        company: 'Freelance',
        period: 'Jan 2022 - Present',
        highlights: [
            'Designed and developed full-stack web applications using Next.js, React, and Node.js.',
            'Implemented database schemas with Drizzle ORM and PostgreSQL for production apps.',
            'Built and published reusable npm packages (nhb-toolbox, nhb-hooks) used by the community.',
            'Integrated third-party services including Cloudinary, Stripe, and various OAuth providers.',
        ],
    },
    {
        title: 'Open Source Contributor',
        company: 'Various Projects',
        period: 'Jun 2023 - Present',
        highlights: [
            'Contributed bug fixes and features to open-source repositories on GitHub.',
            'Maintained personal npm packages with automated CI/CD pipelines.',
            'Helped onboard new developers through documentation and code reviews.',
        ],
    },
];

const education = [
    {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University',
        period: '2018 - 2022',
        details:
            'Focused on software engineering, algorithms, data structures, and web technologies.',
    },
];

/** Resume / CV page with downloadable PDF option. */
export default async function ResumePage() {
    let allSkills: (typeof skills.$inferSelect)[] = [];

    try {
        allSkills = await db.select().from(skills);
    } catch (error) {
        console.error('Failed to fetch skills:', error);
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-12">
            {/* Header */}
            <FadeInUp>
                <div className="mb-10 flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">{siteConfig.name}</h1>
                        <p className="mt-1 text-lg text-muted-foreground">
                            Full-Stack Web Developer
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <a
                                className="inline-flex items-center gap-1 hover:text-foreground"
                                href={`mailto:contact@nazmul.me`}
                            >
                                <Mail className="h-3.5 w-3.5" />
                                contact@nazmul.me
                            </a>
                            <a
                                className="inline-flex items-center gap-1 hover:text-foreground"
                                href={siteConfig.links.github}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <Github className="h-3.5 w-3.5" />
                                GitHub
                            </a>
                            <a
                                className="inline-flex items-center gap-1 hover:text-foreground"
                                href={siteConfig.links.linkedin}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <Linkedin className="h-3.5 w-3.5" />
                                LinkedIn
                            </a>
                        </div>
                    </div>
                    <a
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        download
                        href="/resume.pdf"
                    >
                        <Download className="h-4 w-4" />
                        Download PDF
                    </a>
                </div>
            </FadeInUp>

            <hr className="mb-10 border-border/50" />

            {/* Summary */}
            <FadeInUp>
                <section className="mb-10">
                    <p className="leading-relaxed text-muted-foreground">
                        Passionate Full-Stack Web Developer with hands-on experience building
                        modern, performant, and accessible web applications. Proficient in
                        TypeScript, React, Next.js, Node.js, and cloud services. Committed to
                        clean code, open-source contribution, and continuous learning.
                    </p>
                </section>
            </FadeInUp>

            {/* Experience */}
            <section className="mb-10">
                <SlideInLeft>
                    <div className="mb-6 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold">Experience</h2>
                    </div>
                </SlideInLeft>

                <StaggerContainer className="space-y-8">
                    {experience.map((exp) => (
                        <ScaleInItem key={exp.title}>
                            <div>
                                <div className="mb-1 flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold">{exp.title}</h3>
                                        <p className="text-sm text-primary">{exp.company}</p>
                                    </div>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {exp.period}
                                    </span>
                                </div>
                                <ul className="mt-2 space-y-1">
                                    {exp.highlights.map((h) => (
                                        <li
                                            className="text-sm text-muted-foreground before:mr-2 before:text-primary before:content-['▸']"
                                            key={h}
                                        >
                                            {h}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </ScaleInItem>
                    ))}
                </StaggerContainer>
            </section>

            {/* Education */}
            <section className="mb-10">
                <SlideInRight>
                    <div className="mb-6 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold">Education</h2>
                    </div>
                </SlideInRight>

                <FadeInUp>
                    {education.map((edu) => (
                        <div key={edu.degree}>
                            <div className="mb-1 flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="font-semibold">{edu.degree}</h3>
                                    <p className="text-sm text-primary">{edu.institution}</p>
                                </div>
                                <span className="shrink-0 text-xs text-muted-foreground">
                                    {edu.period}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{edu.details}</p>
                        </div>
                    ))}
                </FadeInUp>
            </section>

            {/* Skills */}
            {allSkills.length > 0 && (
                <section className="mb-10">
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
                                        className="h-3.5 w-3.5 object-contain"
                                        height={14}
                                        src={skill.icon}
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
