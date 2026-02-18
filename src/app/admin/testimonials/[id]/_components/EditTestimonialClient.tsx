'use client';

import { useRouter } from 'next/navigation';
import { TestimonialForm } from '@/components/forms/testimonial-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteOldCloudFile } from '@/lib/actions/cloudinary';
import { useApiMutation } from '@/lib/hooks/use-api';
import type { SelectTestimonial, UpdateTestimonial } from '@/types/testimonials';

interface Props {
    testimonial: SelectTestimonial;
}

export function EditTestimonialClient({ testimonial }: Props) {
    const router = useRouter();

    const { isPending, mutate } = useApiMutation<SelectTestimonial, UpdateTestimonial>(
        `/api/testimonials?id=${testimonial.id}`,
        'PATCH',
        {
            successMessage: 'Testimonial updated successfully!',
            errorMessage: 'Failed to update testimonial. Please try again.',
            invalidateKeys: ['testimonials', testimonial.id],
            onError: (error) => {
                console.error('Failed to update testimonial:', error);
            },
        }
    );

    const handleSubmit = async (data: UpdateTestimonial) => {
        mutate(data, {
            onSuccess: async () => {
                await deleteOldCloudFile(testimonial.client_avatar, data.client_avatar);
                router.push('/admin/testimonials');
            },
        });
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
                        isLoading={isPending}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
