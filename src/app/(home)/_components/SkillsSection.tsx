'use client';

import Image from 'next/image';
import { FadeInUp, ScaleInItem, StaggerContainer } from '@/components/misc/animations';
import { buildCloudinaryUrl } from '@/lib/utils';
import type { SelectSkill } from '@/types/skills';

// const floatAnimation = {
//     y: [0, -6, 0],
//     transition: {
//         duration: 3,
//         repeat: 3,
//         ease: 'easeInOut',
//     },
// } satisfies TargetAndTransition;

interface SkillsSectionProps {
    skills: SelectSkill[];
}

/** Skills section displaying technology expertise with animated icons from DB. */
export function SkillsSection({ skills }: SkillsSectionProps) {
    if (!skills.length) return null;

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
                    {skills.map((skill) => (
                        <ScaleInItem key={skill.id}>
                            <div className="group flex cursor-default flex-col items-center justify-center gap-3 rounded-xl border border-border/50 bg-card p-5 text-center transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
                                <div className="relative h-10 w-10 transition-transform duration-300 group-hover:scale-110">
                                    <Image
                                        alt={skill.title}
                                        className="object-contain"
                                        fill
                                        sizes="40px"
                                        src={buildCloudinaryUrl(skill.icon)}
                                    />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                                    {skill.title}
                                </span>
                            </div>
                        </ScaleInItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
