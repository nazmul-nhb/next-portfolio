'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { TestimonialForm } from '@/components/forms/testimonial-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { httpRequest } from '@/lib/actions/baseRequest';
import type { InsertTestimonial, UpdateTestimonial } from '@/types/testimonials';

export default function NewTestimonialPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: InsertTestimonial | UpdateTestimonial) => {
        setIsLoading(true);
        try {
            await httpRequest('/api/testimonials', {
                method: 'POST',
                body: data,
            });

            toast.success('Testimonial created successfully');
            router.push('/admin/testimonials');
            router.refresh();
        } catch (error) {
            console.error('Failed to create testimonial:', error);
            toast.error('Failed to create testimonial. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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
                    <TestimonialForm isLoading={isLoading} onSubmit={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    );
}
