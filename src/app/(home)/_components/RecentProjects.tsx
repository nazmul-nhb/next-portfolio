import { desc } from 'drizzle-orm';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FadeInUp, ScaleInItem, StaggerContainer } from '@/components/animations';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/drizzle';
import { projects } from '@/lib/drizzle/schema/projects';

/**
 * Recent projects section on the homepage.
 */
export async function RecentProjectsSection() {
    let recentProjects: (typeof projects.$inferSelect)[] = [];

    try {
        recentProjects = await db
            .select()
            .from(projects)
            .orderBy(desc(projects.created_at))
            .limit(6);
    } catch (error) {
        console.error('Failed to fetch recent projects:', error);
    }

    if (!recentProjects.length) return null;

    return (
        <section className="py-20">
            <div className="mx-auto max-w-6xl px-4">
                <FadeInUp>
                    <div className="mb-12 flex items-center justify-between">
                        <div>
                            <h2 className="mb-3 text-3xl font-bold tracking-tight">
                                Recent Projects
                            </h2>
                            <p className="text-muted-foreground">
                                Some of my latest work and side projects
                            </p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/projects">View All</Link>
                        </Button>
                    </div>
                </FadeInUp>

                <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {recentProjects.map((project) => (
                        <ScaleInItem key={project.id}>
                            <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                                {project.screenshots[0] && (
                                    <div className="aspect-video overflow-hidden bg-muted">
                                        <Image
                                            alt={project.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            height={200}
                                            src={project.screenshots[0]}
                                            width={360}
                                        />
                                    </div>
                                )}
                                <div className="flex flex-1 flex-col p-5">
                                    <div className="mb-2 flex items-center gap-2">
                                        {project.favicon && (
                                            <Image
                                                alt=""
                                                className="h-5 w-5 rounded"
                                                height={20}
                                                src={project.favicon}
                                                width={20}
                                            />
                                        )}
                                        <h3 className="font-semibold">{project.title}</h3>
                                    </div>
                                    <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
                                        {project.description}
                                    </p>
                                    <div className="mb-3 flex flex-wrap gap-1.5">
                                        {project.tech_stack.slice(0, 4).map((tech) => (
                                            <span
                                                className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
                                                key={tech}
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                    <a
                                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                        href={project.live_link}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        Live Demo <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>
                        </ScaleInItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
