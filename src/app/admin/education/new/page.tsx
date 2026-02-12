'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { EducationForm } from '@/components/education-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { httpRequest } from '@/lib/actions/baseRequest';
import type { InsertEducation, UpdateEducation } from '@/types/career';

export default function NewEducationPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: InsertEducation | UpdateEducation) => {
        setIsLoading(true);
        try {
            await httpRequest('/api/education', {
                method: 'POST',
                body: data,
            });

            toast.success('Education created successfully');
            router.push('/admin/education' as '/');
            router.refresh();
        } catch (error) {
            console.error('Failed to create education:', error);
            toast.error('Failed to create education. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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
                    <EducationForm isLoading={isLoading} onSubmit={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    );
}
