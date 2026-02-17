'use client';

import { useRouter } from 'next/navigation';
import { ProjectForm } from '@/components/forms/project-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteOldCloudFile } from '@/lib/actions/cloudinary';
import { useApiMutation } from '@/lib/hooks/use-api';
import type { SelectProject, UpdateProject } from '@/types/projects';

interface Props {
    project: SelectProject;
}

export function EditProjectClient({ project }: Props) {
    const router = useRouter();

    const { isPending, mutate } = useApiMutation<SelectProject, UpdateProject>(
        `/api/projects?id=${project.id}`,
        'PATCH',
        {
            successMessage: 'Project updated successfully!',
            errorMessage: 'Failed to update project. Please try again.',
            invalidateKeys: ['projects', project.id],
        }
    );

    const handleSubmit = (data: UpdateProject) => {
        mutate(data, {
            onSuccess: async () => {
                await deleteOldCloudFile(project.favicon, data.favicon);
                router.push('/admin/projects');
                router.refresh();
            },
            onError: (error) => {
                console.error('Failed to update project:', error);
            },
        });
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
                        defaultValues={project}
                        isLoading={isPending}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
