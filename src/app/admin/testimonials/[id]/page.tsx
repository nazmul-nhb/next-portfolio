import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db } from '@/lib/drizzle';
import { testimonials } from '@/lib/drizzle/schema';
import { EditTestimonialClient } from './_components/EditTestimonialClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditTestimonialPage({ params }: PageProps) {
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
