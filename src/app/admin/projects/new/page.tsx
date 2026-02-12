'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProjectForm } from '@/components/project-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { httpRequest } from '@/lib/actions/baseRequest';
import type { InsertProject } from '@/types/projects';

export default function NewProjectPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: InsertProject) => {
        setIsLoading(true);
        try {
            await httpRequest('/api/projects', {
                method: 'POST',
                body: data,
            });

            router.push('/admin/projects');
            router.refresh();
        } catch (error) {
            console.error('Failed to create project:', error);
            toast.error('Failed to create project. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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
                    <ProjectForm isLoading={isLoading} onSubmit={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    );
}
