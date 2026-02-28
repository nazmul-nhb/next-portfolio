'use client';

import type { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import { EducationForm } from '@/components/forms/education-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiMutation } from '@/lib/hooks/use-api';
import type { InsertEducation } from '@/types/career';

export const metadata: Metadata = {
    title: 'Add New Education » Admin Dashboard',
};

export default function NewEducationPage() {
    const router = useRouter();

    const { mutate, isPending } = useApiMutation<InsertEducation>('/api/education', 'POST', {
        successMessage: 'Education created successfully',
        errorMessage: 'Failed to create education. Please try again.',
        invalidateKeys: ['education'],
        onSuccess: () => router.push('/admin/education'),
        onError: (error) => {
            console.error('Failed to create education:', error);
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Add New Education</h1>
                <p className="text-muted-foreground">Add a new education entry</p>
            </div>

            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>Education Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <EducationForm isLoading={isPending} onSubmit={mutate} />
                </CardContent>
            </Card>
        </div>
    );
}
