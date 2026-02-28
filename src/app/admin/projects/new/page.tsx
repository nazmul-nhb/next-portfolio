'use client';

import { useRouter } from 'next/navigation';
import { useTitle } from 'nhb-hooks';
import { ProjectForm } from '@/components/forms/project-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiMutation } from '@/lib/hooks/use-api';
import type { InsertProject } from '@/types/projects';

export default function NewProjectPage() {
    const router = useRouter();

    useTitle('Add New Project » Admin Dashboard');

    const { mutate, isPending: isLoading } = useApiMutation<InsertProject, InsertProject>(
        '/api/projects',
        'POST',
        {
            successMessage: 'Project created successfully',
            errorMessage: 'Failed to create project. Please try again.',
            invalidateKeys: ['projects'],
            onSuccess: () => router.push('/admin/projects'),
            onError: (error) => console.error('Failed to create project:', error),
        }
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Create New Project</h1>
                <p className="text-muted-foreground">Add a new project to your portfolio</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProjectForm isLoading={isLoading} onSubmit={mutate} />
                </CardContent>
            </Card>
        </div>
    );
}
