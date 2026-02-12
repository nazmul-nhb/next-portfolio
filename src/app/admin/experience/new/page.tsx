'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ExperienceForm } from '@/components/experience-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { httpRequest } from '@/lib/actions/baseRequest';
import type { InsertExperience, UpdateExperience } from '@/types/career';

export default function NewExperiencePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: InsertExperience | UpdateExperience) => {
        setIsLoading(true);
        try {
            await httpRequest('/api/experiences', {
                method: 'POST',
                body: data,
            });

            toast.success('Experience created successfully');
            router.push('/admin/experience' as '/');
            router.refresh();
        } catch (error) {
            console.error('Failed to create experience:', error);
            toast.error('Failed to create experience. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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
                    <ExperienceForm isLoading={isLoading} onSubmit={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    );
}
