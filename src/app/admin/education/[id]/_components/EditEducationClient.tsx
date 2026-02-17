'use client';

import { useRouter } from 'next/navigation';
import { EducationForm } from '@/components/forms/education-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteOldCloudFile } from '@/lib/actions/cloudinary';
import { useApiMutation } from '@/lib/hooks/use-api';
import type { SelectEducation, UpdateEducation } from '@/types/career';

interface Props {
    education: SelectEducation;
}

export function EditEducationClient({ education }: Props) {
    const router = useRouter();

    const { isPending, mutate } = useApiMutation<SelectEducation, UpdateEducation>(
        `/api/education?id=${education.id}`,
        'PATCH',
        {
            successMessage: 'Education updated successfully!',
            errorMessage: 'Failed to update education. Please try again.',
            invalidateKeys: ['education', education.id],
        }
    );

    const handleSubmit = async (data: UpdateEducation) => {
        mutate(data, {
            onSuccess: async () => {
                await deleteOldCloudFile(education.institution_logo, data.institution_logo);
                router.push('/admin/education');
                router.refresh();
            },
            onError: (error) => {
                console.error('Failed to update education:', error);
            },
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Edit Education</h1>
                <p className="text-muted-foreground">Update education details</p>
            </div>

            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>{education.degree}</CardTitle>
                </CardHeader>
                <CardContent>
                    <EducationForm
                        defaultValues={education}
                        isLoading={isPending}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
