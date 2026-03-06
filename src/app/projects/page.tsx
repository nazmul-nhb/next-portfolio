import { desc } from 'drizzle-orm';
import { Globe } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { truncateString } from 'nhb-toolbox';
import { FaGitAlt } from 'react-icons/fa';
import {
    FadeInUp,
    MotionCard,
    SectionHeading,
    StaggerContainer,
} from '@/components/misc/animations';
import { siteConfig } from '@/configs/site';
import { db } from '@/lib/drizzle';
import { projects } from '@/lib/drizzle/schema/projects';
import { buildCloudinaryUrl, buildOpenGraphImages, eliminateEmptyStrings } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'Projects',
    description: `Explore ${siteConfig.name}'s projects.`,
    keywords: [...siteConfig.keywords],
    openGraph: {
        title: `${siteConfig.name}'s Projects`,
        description: `Explore ${siteConfig.name}'s projects.`,
        url: `${siteConfig.baseUrl}/projects`,
        siteName: siteConfig.name,
        images: buildOpenGraphImages(siteConfig.logoSvg, siteConfig.favicon),
    },
    twitter: {
        card: 'summary_large_image',
        title: `${siteConfig.name}'s Projects`,
        description: `Explore ${siteConfig.name}'s projects.`,
        images: buildOpenGraphImages(siteConfig.logoSvg, siteConfig.favicon),
        creator: '@nhb42',
    },
};

export const revalidate = 60;

/** Projects listing page. */
export default async function ProjectsPage() {
    let allProjects: (typeof projects.$inferSelect)[] = [];

    try {
        allProjects = await db.select().from(projects).orderBy(desc(projects.created_at));
    } catch (error) {
        console.error('Failed to fetch projects:', error);
    }

    return (
        <div className="relative mx-auto max-w-6xl px-4 py-12 overflow-x-hidden">
            {/* Decorative background */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
                <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-violet-500/5 blur-3xl" />
            </div>
            <SectionHeading
                align="center"
                className="mb-12"
                subtitle="A collection of projects I've built. Each one reflects my passion for clean code and great user experiences."
            >
                Projects
            </SectionHeading>

            {allProjects.length === 0 ? (
                <FadeInUp>
                    <div className="py-20 text-center text-muted-foreground">
                        No projects yet. Check back soon!
                    </div>
                </FadeInUp>
            ) : (
                <StaggerContainer className="grid gap-8 md:grid-cols-2">
                    {allProjects.map((project) => {
                        const repositories = eliminateEmptyStrings(project.repo_links);

                        return (
                            <MotionCard key={project.id}>
                                <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:shadow-lg">
                                    {/* Stretched link overlay – makes entire card clickable */}
                                    <Link
                                        aria-label={`View ${project.title}`}
                                        className="absolute inset-0 z-0"
                                        href={`/projects/${project.id}`}
                                    />
                                    {/* Screenshots preview */}
                                    {project.screenshots.length > 0 && (
                                        <div className="relative aspect-video overflow-hidden bg-muted">
                                            <Image
                                                alt={project.title}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                height={300}
                                                src={buildCloudinaryUrl(project.screenshots[0])}
                                                width={600}
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                        </div>
                                    )}

                                    <div className="flex flex-1 flex-col p-6">
                                        {/* Title + favicon */}
                                        <div className="mb-3 flex items-center gap-3">
                                            {project.favicon && (
                                                <Image
                                                    alt={project.title}
                                                    className="h-6 w-6 rounded"
                                                    height={24}
                                                    src={buildCloudinaryUrl(project.favicon)}
                                                    width={24}
                                                />
                                            )}
                                            <h2 className="text-xl font-semibold">
                                                {project.title}
                                            </h2>
                                        </div>

                                        {/* Description */}
                                        <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                                            {truncateString(project.description, 216)}
                                        </p>

                                        {/* Tech Stack */}
                                        <div className="mb-4 flex flex-wrap gap-2">
                                            {project.tech_stack.map((tech) => (
                                                <span
                                                    className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                                                    key={tech}
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Features */}
                                        {project.features.length > 0 && (
                                            <ul className="mb-4 space-y-1">
                                                {project.features.slice(0, 3).map((feature) => (
                                                    <li
                                                        className="text-xs text-muted-foreground before:mr-2 before:content-['•']"
                                                        key={feature}
                                                    >
                                                        {feature}
                                                    </li>
                                                ))}
                                                {project.features.length > 3 && (
                                                    <li className="text-xs text-muted-foreground/60">
                                                        +{project.features.length - 3} more
                                                        features
                                                    </li>
                                                )}
                                            </ul>
                                        )}

                                        {/* Links – raised above overlay */}
                                        <div className="relative z-10 mt-auto flex flex-wrap items-center gap-3 border-t border-border/50 pt-4">
                                            <a
                                                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                                                href={project.live_link}
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >
                                                <Globe className="size-4 mb-px" />
                                                Live Demo
                                            </a>
                                            {repositories.map((repo, idx) => (
                                                <a
                                                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                                                    href={repo}
                                                    key={repo}
                                                    rel="noopener noreferrer"
                                                    target="_blank"
                                                >
                                                    <FaGitAlt className="size-4 mb-px" />
                                                    {repositories.length > 1
                                                        ? `Repo ${idx + 1}`
                                                        : 'Source Code'}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            </MotionCard>
                        );
                    })}
                </StaggerContainer>
            )}
        </div>
    );
}
