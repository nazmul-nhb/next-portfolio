import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db } from '@/lib/drizzle';
import { testimonials } from '@/lib/drizzle/schema';
import { EditTestimonialClient } from './_components/EditTestimonialClient';

export default async function EditTestimonialPage({
    params,
}: PageProps<'/admin/testimonials/[id]'>) {
    const { id } = await params;
    const testimonialId = +id;

    if (Number.isNaN(testimonialId)) {
        notFound();
    }

    const [testimonial] = await db
        .select()
        .from(testimonials)
        .where(eq(testimonials.id, testimonialId));

    if (!testimonial) {
        notFound();
    }

    return <EditTestimonialClient testimonial={testimonial} />;
}
