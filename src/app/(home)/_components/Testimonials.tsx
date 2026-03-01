import { asc } from 'drizzle-orm';
import { Star } from 'lucide-react';
import { MotionCard, SectionHeading, StaggerContainer } from '@/components/misc/animations';
import UserAvatar from '@/components/misc/user-avatar';
import { db } from '@/lib/drizzle';
import { testimonials } from '@/lib/drizzle/schema';
import type { SelectTestimonial } from '@/types/testimonials';

/**
 * Testimonials section displaying client feedback.
 */
export async function TestimonialsSection() {
    let allTestimonials: SelectTestimonial[] = [];

    try {
        allTestimonials = await db
            .select()
            .from(testimonials)
            .orderBy(asc(testimonials.created_at))
            .limit(6);
    } catch (error) {
        console.error('Failed to fetch testimonials:', error);
    }

    if (!allTestimonials.length) return null;

    return (
        <section className="border-t border-border/50 bg-muted/30 py-8 sm:py-14 md:py-20">
            <div className="mx-auto max-w-6xl px-4">
                <SectionHeading
                    align="left"
                    className="mb-12"
                    subtitle="Feedback from colleagues and clients"
                >
                    What People Say
                </SectionHeading>

                <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {allTestimonials.map((t) => (
                        <MotionCard key={t.id}>
                            <div className="flex h-full flex-col rounded-xl border border-border/50 bg-card p-6 transition-all hover:shadow-md">
                                <div className="mb-4 flex gap-1">
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                        <Star
                                            className={`h-4 w-4 ${
                                                idx < t.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-muted-foreground'
                                            }`}
                                            key={idx}
                                        />
                                    ))}
                                </div>
                                <p className="mb-6 flex-1 text-sm leading-relaxed italic text-muted-foreground">
                                    &ldquo;{t.content}&rdquo;
                                </p>
                                <div className="flex items-center gap-3 border-t border-border pt-4">
                                    <UserAvatar
                                        className="size-10"
                                        image={t.client_avatar}
                                        name={t.client_name}
                                    />
                                    <div>
                                        <p className="text-sm font-medium">{t.client_name}</p>
                                        {t.client_role && (
                                            <p className="text-xs text-muted-foreground">
                                                {t.client_role}
                                                {t.client_company && ` at ${t.client_company}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </MotionCard>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
