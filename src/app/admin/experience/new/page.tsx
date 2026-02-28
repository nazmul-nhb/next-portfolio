'use client';

import type { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import { ExperienceForm } from '@/components/forms/experience-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiMutation } from '@/lib/hooks/use-api';
import type { InsertExperience, UpdateExperience } from '@/types/career';

export const metadata: Metadata = {
    title: 'Add New Experience » Admin Dashboard',
};

export default function NewExperiencePage() {
    const router = useRouter();

    const { mutate, isPending: isLoading } = useApiMutation<
        InsertExperience,
        InsertExperience | UpdateExperience
    >('/api/experiences', 'POST', {
        successMessage: 'Experience created successfully',
        errorMessage: 'Failed to create experience. Please try again.',
        invalidateKeys: ['experiences'],
        onSuccess: () => router.push('/admin/experience'),
        onError: (error) => console.error('Failed to create experience:', error),
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Add New Experience</h1>
                <p className="text-muted-foreground">Add a new work experience entry</p>
            </div>

            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>Experience Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <ExperienceForm isLoading={isLoading} onSubmit={mutate} />
                </CardContent>
            </Card>
        </div>
    );
}
