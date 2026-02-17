'use client';

import { useRouter } from 'next/navigation';
import { ExperienceForm } from '@/components/forms/experience-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteOldCloudFile } from '@/lib/actions/cloudinary';
import { useApiMutation } from '@/lib/hooks/use-api';
import type { SelectExperience, UpdateExperience } from '@/types/career';

interface Props {
    experience: SelectExperience;
}

export function EditExperienceClient({ experience }: Props) {
    const router = useRouter();

    const { isPending, mutate } = useApiMutation<SelectExperience, UpdateExperience>(
        `/api/experiences?id=${experience.id}`,
        'PATCH',
        {
            successMessage: 'Experience updated successfully!',
            errorMessage: 'Failed to update experience. Please try again.',
            invalidateKeys: ['experiences', experience.id],
        }
    );

    const handleSubmit = async (data: UpdateExperience) => {
        mutate(data, {
            onSuccess: async () => {
                await deleteOldCloudFile(experience.company_logo, data.company_logo);
                router.push('/admin/experience');
                router.refresh();
            },
            onError: (error) => {
                console.error('Failed to update experience:', error);
            },
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Edit Experience</h1>
                <p className="text-muted-foreground">Update experience details</p>
            </div>

            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>{experience.position}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ExperienceForm
                        defaultValues={experience}
                        isLoading={isPending}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
