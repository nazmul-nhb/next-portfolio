'use client';

import { motion, type Variants } from 'framer-motion';
import Image from 'next/image';
import { SectionHeading } from '@/components/misc/animations';
import { buildCloudinaryUrl } from '@/lib/utils';
import type { SelectSkill } from '@/types/skills';

/** Grid columns per breakpoint — keep in sync with the grid classes below. */
const COLS_LG = 5;

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0 } },
};

/** Each item's delay is derived from its row index (passed via `custom`). */
const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (rowIdx: number) => ({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.25, ease: 'easeOut', delay: rowIdx * 0.1 },
    }),
};

interface SkillsSectionProps {
    skills: SelectSkill[];
}

/** Skills section displaying technology expertise with animated icons from DB. */
export function SkillsSection({ skills }: SkillsSectionProps) {
    if (!skills.length) return null;

    return (
        <section className="border-t border-border/50 bg-muted/30 py-8 sm:py-14 md:py-20">
            <div className="mx-auto max-w-6xl px-4">
                <SectionHeading
                    className="mb-12"
                    subtitle="Technologies I use to bring ideas to life"
                >
                    Skills & Expertise
                </SectionHeading>

                <motion.div
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                    initial="hidden"
                    variants={containerVariants}
                    viewport={{ once: true, amount: 0.1 }}
                    whileInView="visible"
                >
                    {skills.map((skill, idx) => (
                        <motion.div
                            custom={Math.floor(idx / COLS_LG)}
                            key={skill.id}
                            variants={itemVariants}
                        >
                            <div className="group flex cursor-default flex-col items-center justify-center gap-3 rounded-xl border border-border/50 bg-card p-5 text-center transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
                                <div className="relative size-10 transition-transform duration-300 group-hover:scale-110">
                                    <Image
                                        alt={skill.title}
                                        className="object-contain"
                                        fill
                                        loading="eager"
                                        quality={100}
                                        sizes="40px"
                                        src={buildCloudinaryUrl(skill.icon)}
                                    />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                                    {skill.title}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
