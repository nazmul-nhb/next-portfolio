'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { TestimonialForm } from '@/components/forms/testimonial-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { httpRequest } from '@/lib/actions/baseRequest';
import type { SelectTestimonial, UpdateTestimonial } from '@/types/testimonials';

interface EditTestimonialClientProps {
    testimonial: SelectTestimonial;
}

export function EditTestimonialClient({ testimonial }: EditTestimonialClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: UpdateTestimonial) => {
        setIsLoading(true);
        try {
            await httpRequest(`/api/testimonials?id=${testimonial.id}`, {
                method: 'PATCH',
                body: data,
            });

            toast.success('Testimonial updated successfully');
            router.push('/admin/testimonials');
            router.refresh();
        } catch (error) {
            console.error('Failed to update testimonial:', error);
            toast.error('Failed to update testimonial. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="Text-3xl font-bold">Edit Testimonial</h1>
                <p className="text-muted-foreground">Update testimonial details</p>
            </div>

            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>{testimonial.client_name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <TestimonialForm
                        defaultValues={testimonial}
                        isLoading={isLoading}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
