import { Star } from 'lucide-react';
import Image from 'next/image';
import { FadeInUp, ScaleInItem, StaggerContainer } from '@/components/animations';
import { ENV } from '@/configs/env';
import { db } from '@/lib/drizzle';
import { testimonials } from '@/lib/drizzle/schema';

/**
 * Testimonials section displaying client feedback.
 */
export async function TestimonialsSection() {
    let allTestimonials: (typeof testimonials.$inferSelect)[] = [];

    try {
        allTestimonials = await db.select().from(testimonials).limit(6);
    } catch (error) {
        console.error('Failed to fetch testimonials:', error);
    }

    if (!allTestimonials.length) return null;

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
                    {allTestimonials.map((t) => (
                        <ScaleInItem key={t.id}>
                            <div className="flex h-full flex-col rounded-xl border border-border/50 bg-card p-6 transition-all hover:shadow-md">
                                <div className="mb-4 flex gap-1">
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                        <Star
                                            key={idx}
                                            className={`h-4 w-4 ${
                                                idx < t.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-muted-foreground'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="mb-6 flex-1 text-sm leading-relaxed italic text-muted-foreground">
                                    &ldquo;{t.content}&rdquo;
                                </p>
                                <div className="flex items-center gap-3 border-t border-border pt-4">
                                    {t.client_avatar ? (
                                        <div className="h-10 w-10 overflow-hidden rounded-full border">
                                            <Image
                                                alt={t.client_name}
                                                className="object-cover"
                                                height={40}
                                                src={`${ENV.cloudinary.urls.base_url}${t.client_avatar}`}
                                                width={40}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                            {t.client_name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
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
                        </ScaleInItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
