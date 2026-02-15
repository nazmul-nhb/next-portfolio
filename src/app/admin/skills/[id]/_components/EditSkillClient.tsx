'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { SkillForm } from '@/components/forms/skill-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { httpRequest } from '@/lib/actions/baseRequest';
import { deleteOldCloudFile } from '@/lib/actions/cloudinary';
import type { SelectSkill, UpdateSkill } from '@/types/skills';

interface EditSkillClientProps {
    skill: SelectSkill;
}

export function EditSkillClient({ skill }: EditSkillClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: UpdateSkill) => {
        setIsLoading(true);
        try {
            const { success, data: updated } = await httpRequest<SelectSkill, UpdateSkill>(
                `/api/skills?id=${skill.id}`,
                {
                    method: 'PATCH',
                    body: data,
                }
            );

            if (success && updated) {
                await deleteOldCloudFile(skill.icon, data.icon);

                router.push('/admin/skills');
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to update skill:', error);
            toast.error('Failed to update skill. Please try again.');
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
                    <SkillForm
                        defaultValues={skill}
                        isLoading={isLoading}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
