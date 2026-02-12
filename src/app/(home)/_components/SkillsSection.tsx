'use client';

import { FadeInUp, ScaleInItem, StaggerContainer } from '@/components/animations';
import { siteConfig } from '@/configs/site';

/**
 * Skills section displaying technology expertise with animated icons.
 */
export function SkillsSection() {
    return (
        <section className="border-t border-border/50 bg-muted/30 py-20">
            <div className="mx-auto max-w-6xl px-4">
                <FadeInUp>
                    <div className="mb-12 text-center">
                        <h2 className="mb-3 text-3xl font-bold tracking-tight">
                            Skills & Expertise
                        </h2>
                        <p className="text-muted-foreground">
                            Technologies I use to bring ideas to life
                        </p>
                    </div>
                </FadeInUp>

                <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {siteConfig.skills.map((skill) => (
                        <ScaleInItem key={skill}>
                            <div className="group flex cursor-default items-center justify-center rounded-xl border border-border/50 bg-card p-4 text-center transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
                                <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                                    {skill}
                                </span>
                            </div>
                        </ScaleInItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
