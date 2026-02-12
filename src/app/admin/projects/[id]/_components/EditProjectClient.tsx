'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProjectForm } from '@/components/project-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { httpRequest } from '@/lib/actions/baseRequest';
import type { SelectProject, UpdateProject } from '@/types/projects';

interface EditProjectClientProps {
    project: SelectProject;
}

export function EditProjectClient({ project }: EditProjectClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: UpdateProject) => {
        setIsLoading(true);
        try {
            await httpRequest(`/api/projects?id=${project.id}`, {
                method: 'PATCH',
                body: data,
            });

            router.push('/admin/projects');
            router.refresh();
        } catch (error) {
            console.error('Failed to update project:', error);
            toast.error('Failed to update project. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Edit Project</h1>
                <p className="text-muted-foreground">Update your project details</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProjectForm
                        // @ts-expect-error - ProjectForm accepts string URLs for favicon/screenshots when editing
                        defaultValues={project}
                        isLoading={isLoading}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
