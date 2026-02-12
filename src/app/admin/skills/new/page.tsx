'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SkillForm } from '@/components/skill-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { httpRequest } from '@/lib/actions/baseRequest';
import type { InsertSkill, UpdateSkill } from '@/types/skills';

export default function NewSkillPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: InsertSkill | UpdateSkill) => {
        setIsLoading(true);
        try {
            await httpRequest('/api/skills', {
                method: 'POST',
                body: data,
            });

            router.push('/admin/skills' );
            router.refresh();
        } catch (error) {
            console.error('Failed to create skill:', error);
            alert('Failed to create skill. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Add New Skill</h1>
                <p className="text-muted-foreground">Add a new skill to your profile</p>
            </div>

            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>Skill Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <SkillForm isLoading={isLoading} onSubmit={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    );
}
