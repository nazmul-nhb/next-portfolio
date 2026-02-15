'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProjectForm } from '@/components/forms/project-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { httpRequest } from '@/lib/actions/baseRequest';
import { deleteFromCloudinary } from '@/lib/actions/cloudinary';
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
            const { success, data: updated } = await httpRequest<SelectProject, UpdateProject>(
                `/api/projects?id=${project.id}`,
                {
                    method: 'PATCH',
                    body: data,
                }
            );

            if (success && updated) {
                if (data.favicon && data.favicon !== project.favicon) {
                    await deleteFromCloudinary(project.favicon);
                }

                if (data.screenshots) {
                    for (let i = 0; i < data.screenshots.length; i++) {
                        if (data.screenshots[i] !== project.screenshots[i]) {
                            await deleteFromCloudinary(project.screenshots[i]);
                        }
                    }
                }

                toast.success('Project updated successfully!');
                router.push('/admin/projects');
                router.refresh();
            } else {
                toast.error('Failed to update project. Please try again.');
            }
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
                        defaultValues={project}
                        isLoading={isLoading}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
