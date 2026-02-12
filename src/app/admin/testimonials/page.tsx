import { db } from '@/lib/drizzle';
import { testimonials } from '@/lib/drizzle/schema';
import { TestimonialsClient } from './_components/TestimonialsClient';

export default async function TestimonialsPage() {
    const allTestimonials = await db
        .select()
        .from(testimonials)
        .orderBy(testimonials.created_at);

    return <TestimonialsClient initialTestimonials={allTestimonials} />;
}
