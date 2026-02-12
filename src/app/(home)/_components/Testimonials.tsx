'use client';

import { Quote } from 'lucide-react';
import { FadeInUp, ScaleInItem, StaggerContainer } from '@/components/animations';

const testimonials = [
    {
        name: 'Alex Chen',
        role: 'Senior Developer at TechCorp',
        content:
            'Nazmul is an exceptional developer who consistently delivers high-quality code. His attention to detail and passion for clean architecture is remarkable.',
        avatar: '🧑‍💼',
    },
    {
        name: 'Sarah Johnson',
        role: 'Product Manager at StartupXYZ',
        content:
            'Working with Nazmul was a pleasure. He understood our requirements perfectly and built a solution that exceeded our expectations.',
        avatar: '👩‍💻',
    },
    {
        name: 'Michael Park',
        role: 'CTO at InnovateLab',
        content:
            'Nazmul brings both technical expertise and creative problem-solving to every project. Highly recommended for any web development work.',
        avatar: '👨‍🔬',
    },
];

/**
 * Testimonials section displaying client feedback.
 */
export function TestimonialsSection() {
    return (
        <section className="py-20">
            <div className="mx-auto max-w-6xl px-4">
                <FadeInUp>
                    <div className="mb-12 text-center">
                        <h2 className="mb-3 text-3xl font-bold tracking-tight">
                            What People Say
                        </h2>
                        <p className="text-muted-foreground">
                            Feedback from colleagues and clients
                        </p>
                    </div>
                </FadeInUp>

                <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((t) => (
                        <ScaleInItem key={t.name}>
                            <div className="flex h-full flex-col rounded-xl border border-border/50 bg-card p-6 transition-all hover:shadow-md">
                                <Quote className="mb-4 h-8 w-8 text-primary/30" />
                                <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                                    &ldquo;{t.content}&rdquo;
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
                                        {t.avatar}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium">{t.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {t.role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </ScaleInItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
