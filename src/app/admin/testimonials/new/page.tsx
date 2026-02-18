'use client';

import { useRouter } from 'next/navigation';
import { TestimonialForm } from '@/components/forms/testimonial-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiMutation } from '@/lib/hooks/use-api';
import type { InsertTestimonial, SelectTestimonial } from '@/types/testimonials';

export default function NewTestimonialPage() {
    const router = useRouter();

    const { mutate, isPending } = useApiMutation<SelectTestimonial, InsertTestimonial>(
        '/api/testimonials',
        'POST',
        {
            successMessage: 'Testimonial created successfully',
            errorMessage: 'Failed to create testimonial. Please try again.',
            invalidateKeys: ['testimonials'],
            onSuccess: () => {
                router.push('/admin/testimonials');
            },
            onError: (error) => {
                console.error('Failed to create testimonial:', error);
            },
        }
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Add New Testimonial</h1>
                <p className="text-muted-foreground">Add a new client testimonial</p>
            </div>

            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>Testimonial Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <TestimonialForm isLoading={isPending} onSubmit={mutate} />
                </CardContent>
            </Card>
        </div>
    );
}
