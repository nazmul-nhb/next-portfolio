'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ExperienceForm } from '@/components/experience-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { httpRequest } from '@/lib/actions/baseRequest';
import type { SelectExperience, UpdateExperience } from '@/types/career';

interface EditExperienceClientProps {
    experience: SelectExperience;
}

export function EditExperienceClient({ experience }: EditExperienceClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: UpdateExperience) => {
        setIsLoading(true);
        try {
            await httpRequest(`/api/experiences?id=${experience.id}`, {
                method: 'PATCH',
                body: data,
            });

            toast.success('Experience updated successfully');
            router.push('/admin/experience' as '/');
            router.refresh();
        } catch (error) {
            console.error('Failed to update experience:', error);
            toast.error('Failed to update experience. Please try again.');
        } finally {
            setIsLoading(false);
        }
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
                        isLoading={isLoading}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
