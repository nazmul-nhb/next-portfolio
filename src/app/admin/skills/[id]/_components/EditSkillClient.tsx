'use client';

import { useRouter } from 'next/navigation';
import { SkillForm } from '@/components/forms/skill-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteOldCloudFile } from '@/lib/actions/cloudinary';
import { useApiMutation } from '@/lib/hooks/use-api';
import type { SelectSkill, UpdateSkill } from '@/types/skills';

interface Props {
    skill: SelectSkill;
}

export function EditSkillClient({ skill }: Props) {
    const router = useRouter();

    const { isPending, mutate } = useApiMutation<SelectSkill, UpdateSkill>(
        `/api/skills?id=${skill.id}`,
        'PATCH',
        {
            successMessage: 'Skill updated successfully!',
            errorMessage: 'Failed to update skill. Please try again.',
            invalidateKeys: ['skills', skill.id],
        }
    );

    const handleSubmit = (data: UpdateSkill) => {
        mutate(data, {
            onSuccess: async () => {
                await deleteOldCloudFile(skill.icon, data.icon);
                router.push('/admin/skills');
                router.refresh();
            },
            onError: (error) => {
                console.error('Failed to update skill:', error);
            },
        });
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
                        isLoading={isPending}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
