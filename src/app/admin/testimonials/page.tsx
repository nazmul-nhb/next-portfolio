import { desc } from 'drizzle-orm';
import { db } from '@/lib/drizzle';
import { testimonials } from '@/lib/drizzle/schema';
import type { SelectTestimonial } from '@/types/testimonials';
import { TestimonialsClient } from './_components/TestimonialsClient';

export default async function TestimonialsPage() {
    let allTestimonials: SelectTestimonial[] = [];

    try {
        allTestimonials = await db
            .select()
            .from(testimonials)
            .orderBy(desc(testimonials.created_at));
    } catch (error) {
        console.error('Error fetching testimonials:', error);
    }

    return <TestimonialsClient initialData={allTestimonials} />;
}
