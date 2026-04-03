import { eq } from 'drizzle-orm';
import { ArrowLeft, Calendar, CheckCircle } from 'lucide-react';
import type { Metadata, Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDate } from 'nhb-toolbox';
import type { Maybe } from 'nhb-toolbox/types';
import { FaGitAlt } from 'react-icons/fa';
import ScreenshotGallery from '@/app/projects/[id]/_components/ScreenshotGallery';
import { FadeInUp, SlideInLeft, SlideInRight } from '@/components/misc/animations';
import LivePreviewButton from '@/components/misc/live-preview';
import ShareButton from '@/components/misc/share-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/configs/site';
import { db } from '@/lib/drizzle';
import { projects } from '@/lib/drizzle/schema/projects';
import {
    buildCanonicalUrl,
    buildCloudinaryUrl,
    buildOpenGraphImages,
    eliminateEmptyStrings,
} from '@/lib/utils';
import type { Params } from '@/types';
import type { SelectProject } from '@/types/projects';

export const revalidate = 60;

/** Generate metadata for project detail page. */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { id } = await params;

    try {
        const [project] = await db
            .select({
                title: projects.title,
                description: projects.description,
                screenshots: projects.screenshots,
                favicon: projects.favicon,
            })
            .from(projects)
            .where(eq(projects.id, +id))
            .limit(1);

        if (!project) return { title: 'Project Not Found' };

        return {
            title: project.title,
            description: project.description,
            alternates: { canonical: buildCanonicalUrl(`/projects/${id}` as Route) },
            icons: {
                icon: siteConfig.favicon,
                shortcut: siteConfig.favicon,
            },
            openGraph: {
                title: project.title,
                description: project.description,
                images: buildOpenGraphImages(
                    project.screenshots[0] && buildCloudinaryUrl(project.screenshots[0]),
                    project.favicon && buildCloudinaryUrl(project.favicon),
                    buildCanonicalUrl(siteConfig.favicon as Route)
                ),
            },
        };
    } catch (error) {
        console.error('Failed to fetch project metadata:', error);
        return { title: 'Project' };
    }
}

/** Project detail page. */
export default async function ProjectDetailPage({ params }: Params) {
    const { id } = await params;

    let project: Maybe<SelectProject>;

    try {
        [project] = await db.select().from(projects).where(eq(projects.id, +id)).limit(1);
    } catch (error) {
        console.error('Failed to fetch project:', error);
    }

    if (!project) notFound();

    const repositories = eliminateEmptyStrings(project.repo_links);

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 overflow-x-hidden">
            {/* Back link */}
            <FadeInUp>
                <Link
                    className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    href="/projects"
                >
                    <ArrowLeft className="size-4" />
                    All Projects
                </Link>
            </FadeInUp>

            {/* Header */}
            <FadeInUp>
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                        {project.favicon && (
                            <Image
                                alt={project.title}
                                className="size-10 rounded-lg sm:size-12"
                                height={48}
                                src={buildCloudinaryUrl(project.favicon)}
                                width={48}
                            />
                        )}
                        <div>
                            <h1 className="text-2xl font-bold sm:text-3xl">{project.title}</h1>
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="size-3" />
                                {formatDate({
                                    date: project.created_at,
                                    format: 'mmm DD, yyyy',
                                })}{' '}
                                (Entry time)
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 text-xs sm:text-base">
                        <LivePreviewButton
                            favicon={project.favicon}
                            title={project.title}
                            url={project.live_link}
                        />
                        <ShareButton
                            buttonLabel="Share"
                            buttonProps={{
                                size: 'sm',
                                variant: 'destructive',
                                className: 'gap-1 sm:gap-2',
                            }}
                            route={`/projects/${project.id}` as Route}
                            shareLabel="Share this project"
                            shareText={project.title}
                        />
                    </div>
                </div>
            </FadeInUp>

            {/* Screenshots gallery */}
            <SlideInLeft>
                <section className="mb-10">
                    <ScreenshotGallery
                        screenshots={project.screenshots}
                        title={project.title}
                    />
                </section>
            </SlideInLeft>

            {/* Content grid */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main content */}
                <div className="lg:col-span-2">
                    {/* Description */}
                    <FadeInUp>
                        <section className="mb-8">
                            <h2 className="mb-3 text-lg font-semibold">About</h2>
                            <p className="leading-relaxed text-muted-foreground">
                                {project.description}
                            </p>
                        </section>
                    </FadeInUp>

                    {/* Features */}
                    {project.features.length > 0 && (
                        <FadeInUp>
                            <section className="mb-8">
                                <h2 className="mb-3 text-lg font-semibold">Features</h2>
                                <ul className="grid gap-2 sm:grid-cols-2">
                                    {project.features.map((feature, idx) => (
                                        <li
                                            className="flex items-start gap-2 text-sm text-muted-foreground"
                                            key={`${feature}-${idx}`}
                                        >
                                            <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-500" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </FadeInUp>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Tech Stack */}
                    <SlideInRight>
                        <div className="rounded-xl border border-border/50 bg-card p-5">
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                Tech Stack
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {project.tech_stack.map((tech) => (
                                    <Badge
                                        className="border-primary/20 bg-primary/10 text-primary"
                                        key={tech}
                                        variant="outline"
                                    >
                                        {tech}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </SlideInRight>

                    {/* Source Code */}
                    {repositories.length > 0 && (
                        <SlideInRight>
                            <div className="rounded-xl border border-border/50 bg-card p-5">
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                    Source Code
                                </h3>
                                <div className="space-y-2">
                                    {repositories.map((repoLink, idx) => (
                                        <a
                                            className="w-fit flex items-center gap-2 text-sm font-medium text-foreground transition-all hover:text-primary border-b border-transparent hover:border-primary"
                                            href={repoLink}
                                            key={`${repoLink}-${idx}`}
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        >
                                            <FaGitAlt className="size-4" />
                                            {repositories.length > 1
                                                ? `Repository ${idx + 1}`
                                                : 'View Source Code'}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </SlideInRight>
                    )}

                    {/* Quick Stats */}
                    <SlideInRight>
                        <div className="rounded-xl border border-border/50 bg-card p-5">
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                Quick Stats
                            </h3>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Features</dt>
                                    <dd className="font-medium">{project.features.length}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Technologies</dt>
                                    <dd className="font-medium">{project.tech_stack.length}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Screenshots</dt>
                                    <dd className="font-medium">
                                        {project.screenshots.length}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Repositories</dt>
                                    <dd className="font-medium">{repositories.length}</dd>
                                </div>
                            </dl>
                        </div>
                    </SlideInRight>
                </div>
            </div>

            {/* Back to projects */}
            <FadeInUp>
                <div className="mt-12 border-t border-border/40 pt-8 text-center">
                    <Link href="/projects">
                        <Button className="gap-2" variant="outline">
                            <ArrowLeft className="size-4" />
                            Back to All Projects
                        </Button>
                    </Link>
                </div>
            </FadeInUp>
        </div>
    );
}
