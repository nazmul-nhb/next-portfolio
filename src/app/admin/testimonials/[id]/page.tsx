import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/drizzle';
import { testimonials } from '@/lib/drizzle/schema';
import type { Params } from '@/types';
import { EditTestimonialClient } from './_components/EditTestimonialClient';

export const metadata: Metadata = {
    title: 'Edit Testimonial',
};

export default async function EditTestimonialPage({ params }: Params) {
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
