import { eq } from 'drizzle-orm';
import { Briefcase, Code2, Github, GraduationCap, Heart, Linkedin } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { formatDate } from 'nhb-toolbox';
import {
    FadeInUp,
    ScaleInItem,
    SlideInLeft,
    SlideInRight,
    StaggerContainer,
} from '@/components/misc/animations';
import { ENV } from '@/configs/env';
import { siteConfig } from '@/configs/site';
import { db } from '@/lib/drizzle';
import { education, users } from '@/lib/drizzle/schema';
import { skills } from '@/lib/drizzle/schema/skills';
import { buildCloudinaryUrl } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'About',
    description: 'Learn more about Nazmul Hassan - Full-Stack Web Developer.',
};

export default async function AboutPage() {
    let allSkills: (typeof skills.$inferSelect)[] = [];
    let allEdu: (typeof education.$inferSelect)[] = [];
    let adminImage: string | null = null;

    try {
        const [sk, ed, [admin]] = await Promise.all([
            db.select().from(skills),
            db.select().from(education).orderBy(education.start_date),
            db
                .select({ profile_image: users.profile_image })
                .from(users)
                .where(eq(users.email, ENV.adminEmail))
                .limit(1),
        ]);

        allSkills = sk;
        allEdu = ed;

        adminImage = admin?.profile_image;
    } catch (error) {
        console.error('Failed to fetch about data:', error);
    }

    return (
        <div className="relative mx-auto max-w-4xl px-4 py-12">
            {/* Decorative background */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
                <div className="absolute bottom-1/3 -left-24 h-56 w-56 rounded-full bg-violet-500/5 blur-3xl" />
            </div>
            {/* Intro */}
            <FadeInUp>
                <div className="mb-16 text-center">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-blue-500/20 to-violet-500/20 shadow-lg shadow-blue-500/10">
                        {adminImage ? (
                            <Image
                                alt={siteConfig.name}
                                className="size-16 rounded-full object-cover"
                                height={320}
                                src={buildCloudinaryUrl(adminImage)}
                                width={320}
                            />
                        ) : (
                            <span className="text-5xl">👨‍💻</span>
                        )}
                    </div>
                    <h1 className="mb-3 text-4xl font-bold tracking-tight">
                        {siteConfig.name}
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
                        A passionate Full-Stack Web Developer with a love for building modern,
                        performant, and accessible web applications. I specialize in React,
                        Next.js, TypeScript, and Node.js, with expertise in database design and
                        cloud services.
                    </p>
                    <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-linear-to-r from-blue-600 to-violet-600" />
                </div>
            </FadeInUp>

            {/* Experience */}
            <section className="mb-16">
                <SlideInLeft>
                    <div className="mb-8 flex items-center gap-3">
                        <Briefcase className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">Experience</h2>
                    </div>
                </SlideInLeft>

                <StaggerContainer className="space-y-6">
                    {[
                        {
                            title: 'Full-Stack Web Developer',
                            company: 'Freelance',
                            period: '2023 - Present',
                            description:
                                'Building web applications and SaaS products for clients. Specializing in React, Next.js, and TypeScript ecosystems.',
                        },
                        {
                            title: 'Open Source Contributor',
                            company: 'Various Projects',
                            period: '2024 - Present',
                            description:
                                'Actively contributing to open-source projects and maintaining personal npm packages used by the community.',
                        },
                    ].map((exp) => (
                        <ScaleInItem key={exp.title}>
                            <div className="rounded-xl border border-border/50 bg-card p-6 transition-all hover:shadow-md">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold">{exp.title}</h3>
                                    <span className="text-xs text-muted-foreground">
                                        {exp.period}
                                    </span>
                                </div>
                                <p className="mb-2 text-sm font-medium text-primary">
                                    {exp.company}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {exp.description}
                                </p>
                            </div>
                        </ScaleInItem>
                    ))}
                </StaggerContainer>
            </section>

            {/* Education */}
            <section className="mb-16">
                <SlideInRight>
                    <div className="mb-8 flex items-center gap-3">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">Education</h2>
                    </div>
                </SlideInRight>

                {allEdu.map((edu) => (
                    <FadeInUp key={edu.id}>
                        <div className="rounded-xl border border-border/50 bg-card p-6">
                            <h3 className="font-semibold">
                                {edu.degree} - {edu.institution}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {formatDate({ date: edu.start_date, format: 'mmm DD, YYYY' })} -{' '}
                                {edu.end_date
                                    ? formatDate({ date: edu.end_date, format: 'mmm DD, YYYY' })
                                    : 'Present'}
                            </p>
                            {edu.grade && (
                                <p className="text-sm font-medium text-primary">
                                    Grade: {edu.grade}
                                </p>
                            )}
                            <p className="mt-2 text-sm text-muted-foreground">
                                • {edu.achievements?.join(' • ')}
                            </p>
                        </div>
                    </FadeInUp>
                ))}
            </section>

            {/* Skills */}
            {allSkills.length > 0 && (
                <section className="mb-16">
                    <SlideInLeft>
                        <div className="mb-8 flex items-center gap-3">
                            <Code2 className="h-6 w-6 text-primary" />
                            <h2 className="text-2xl font-bold">Technical Skills</h2>
                        </div>
                    </SlideInLeft>

                    <StaggerContainer className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {allSkills.map((skill) => (
                            <ScaleInItem key={skill.id}>
                                <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-card p-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                                    <Image
                                        alt={skill.title}
                                        className="h-5 w-5 object-contain"
                                        height={20}
                                        src={buildCloudinaryUrl(skill.icon)}
                                        width={20}
                                    />
                                    {skill.title}
                                </div>
                            </ScaleInItem>
                        ))}
                    </StaggerContainer>
                </section>
            )}

            {/* Interests */}
            <section className="mb-16">
                <SlideInRight>
                    <div className="mb-8 flex items-center gap-3">
                        <Heart className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">Interests</h2>
                    </div>
                </SlideInRight>

                <FadeInUp>
                    <p className="text-muted-foreground leading-relaxed">
                        Beyond coding, I enjoy exploring new technologies, contributing to open
                        source, writing technical blogs, and helping other developers grow.
                        I&apos;m always eager to learn and take on new challenges that push the
                        boundaries of web development.
                    </p>
                </FadeInUp>
            </section>

            {/* Connect */}
            <FadeInUp>
                <div className="rounded-2xl border border-border/50 bg-linear-to-br from-primary/5 to-accent/5 p-8 text-center">
                    <h2 className="mb-3 text-2xl font-bold">Let&apos;s Connect</h2>
                    <p className="mb-6 text-muted-foreground">
                        I&apos;m always open to new opportunities and collaborations.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a
                            aria-label="GitHub"
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-all hover:bg-primary hover:text-primary-foreground"
                            href={siteConfig.links.github}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <Github className="h-5 w-5" />
                        </a>
                        <a
                            aria-label="LinkedIn"
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-all hover:bg-primary hover:text-primary-foreground"
                            href={siteConfig.links.linkedin}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <Linkedin className="h-5 w-5" />
                        </a>
                        {/* <a
                            aria-label="Twitter"
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-all hover:bg-primary hover:text-primary-foreground"
                            href={siteConfig.links.twitter}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <Twitter className="h-5 w-5" />
                        </a> */}
                    </div>
                </div>
            </FadeInUp>
        </div>
    );
}
