'use client';

import { useRouter } from 'next/navigation';
import { SkillForm } from '@/components/forms/skill-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiMutation } from '@/lib/hooks/use-api';
import type { InsertSkill, SelectSkill } from '@/types/skills';

export default function NewSkillPage() {
    const router = useRouter();

    const { mutate, isPending } = useApiMutation<SelectSkill, InsertSkill>(
        '/api/skills',
        'POST',
        {
            successMessage: 'Skill created successfully',
            errorMessage: 'Failed to create skill. Please try again.',
            invalidateKeys: ['skills'],
            onSuccess: () => {
                router.push('/admin/skills');
            },
            onError: (error) => {
                console.error('Failed to create skill:', error);
            },
        }
    );

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
                    <SkillForm isLoading={isPending} onSubmit={mutate} />
                </CardContent>
            </Card>
        </div>
    );
}
