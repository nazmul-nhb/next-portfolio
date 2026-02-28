import { desc } from 'drizzle-orm';
import { Briefcase, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { MotionCard, SectionHeading, StaggerContainer } from '@/components/misc/animations';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/drizzle';
import { education, experiences } from '@/lib/drizzle/schema/career';
import type { SelectEducation, SelectExperience } from '@/types/career';

/**
 * Compact experience + education highlights for the homepage.
 */
export async function CareerHighlightsSection() {
    let recentExperiences: SelectExperience[] = [];
    let recentEducation: SelectEducation[] = [];

    try {
        [recentExperiences, recentEducation] = await Promise.all([
            db.select().from(experiences).orderBy(desc(experiences.start_date)).limit(2),
            db.select().from(education).orderBy(desc(education.start_date)).limit(2),
        ]);
    } catch (error) {
        console.error('Failed to fetch career highlights:', error);
    }

    if (!recentExperiences.length && !recentEducation.length) return null;

    return (
        <section className="py-8 sm:py-14 md:py-20">
            <div className="mx-auto max-w-6xl px-4">
                <SectionHeading
                    className="mb-12"
                    subtitle="A quick snapshot of my professional and academic path"
                >
                    Experience & Education
                </SectionHeading>

                <StaggerContainer className="grid gap-6 lg:grid-cols-2">
                    {recentExperiences.length > 0 && (
                        <MotionCard>
                            <div className="h-full rounded-xl border border-border/50 bg-card p-6 transition-all hover:shadow-md">
                                <div className="mb-5 flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Experience</h3>
                                </div>

                                <div className="space-y-4">
                                    {recentExperiences.map((exp) => (
                                        <div
                                            className="border-l-8 border-l-secondary pl-2"
                                            key={exp.id}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <p className="font-medium">{exp.position}</p>
                                                <span className="text-xs text-muted-foreground">
                                                    {exp.start_date} -{' '}
                                                    {exp.end_date || 'Present'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-primary">
                                                {exp.company}
                                                {exp.location && ` • ${exp.location}`}
                                            </p>
                                            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                                                {exp.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </MotionCard>
                    )}

                    {recentEducation.length > 0 && (
                        <MotionCard>
                            <div className="h-full rounded-xl border border-border/50 bg-card p-6 transition-all hover:shadow-md">
                                <div className="mb-5 flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Education</h3>
                                </div>

                                <div className="space-y-4">
                                    {recentEducation.map((edu) => (
                                        <div
                                            className="border-l-8 border-l-secondary pl-2"
                                            key={edu.id}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <p className="font-medium">{edu.degree}</p>
                                                <span className="text-xs text-muted-foreground">
                                                    {edu.start_date} -{' '}
                                                    {edu.end_date || 'Present'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-primary">
                                                {edu.institution}
                                                {edu.location && ` • ${edu.location}`}
                                            </p>
                                            {edu.description && (
                                                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                                                    {edu.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </MotionCard>
                    )}
                </StaggerContainer>

                <div className="mt-8">
                    <Link href="/resume">
                        <Button variant="outline">View Full Resume</Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
