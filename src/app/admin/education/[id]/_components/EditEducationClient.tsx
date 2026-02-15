'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { EducationForm } from '@/components/forms/education-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { httpRequest } from '@/lib/actions/baseRequest';
import { deleteOldCloudFile } from '@/lib/actions/cloudinary';
import type { SelectEducation, UpdateEducation } from '@/types/career';

interface EditEducationClientProps {
    education: SelectEducation;
}

export function EditEducationClient({ education }: EditEducationClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: UpdateEducation) => {
        setIsLoading(true);
        try {
            const { success, data: updated } = await httpRequest<
                SelectEducation,
                UpdateEducation
            >(`/api/education?id=${education.id}`, {
                method: 'PATCH',
                body: data,
            });
            if (success && updated) {
                await deleteOldCloudFile(education.institution_logo, data.institution_logo);

                toast.success('Education updated successfully');
                router.push('/admin/education');
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to update education:', error);
            toast.error('Failed to update education. Please try again.');
        } finally {
            setIsLoading(false);
        }
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
                        isLoading={isLoading}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
