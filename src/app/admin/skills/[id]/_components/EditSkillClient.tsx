'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SkillForm } from '@/components/skill-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { httpRequest } from '@/lib/actions/baseRequest';
import type { InsertSkill, SelectSkill, UpdateSkill } from '@/types/skills';

interface EditSkillClientProps {
    skill: SelectSkill;
}

export function EditSkillClient({ skill }: EditSkillClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: InsertSkill | UpdateSkill) => {
        setIsLoading(true);
        try {
            await httpRequest(`/api/skills?id=${skill.id}`, {
                method: 'PATCH',
                body: data,
            });

            router.push('/admin/skills' );
            router.refresh();
        } catch (error) {
            console.error('Failed to update skill:', error);
            alert('Failed to update skill. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Edit Skill</h1>
                <p className="text-muted-foreground">Update skill details</p>
            </div>

            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>{skill.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <SkillForm defaultValues={skill} isLoading={isLoading} onSubmit={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    );
}
