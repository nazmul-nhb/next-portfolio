'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { confirmToast } from '@/components/confirm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteFromCloudinary } from '@/lib/actions/cloudinary';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { buildCloudinaryUrl } from '@/lib/utils';
import type { SelectSkill } from '@/types/skills';

interface Props {
    initialData: SelectSkill[];
}

export function SkillsClient({ initialData }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data: skills = initialData } = useApiQuery<SelectSkill[]>('skills', '/api/skills');

    const { mutate, isPending } = useApiMutation<{ id: number }, undefined>(
        `/api/skills?id=${deletingId}`,
        'DELETE',
        {
            successMessage: 'Skill deleted successfully!',
            errorMessage: 'Failed to delete skill. Please try again.',
            invalidateKeys: ['skills'],
            onError: (error) => {
                console.error('Failed to delete testimonial:', error);
            },
        }
    );

    const handleDelete = async (skill: SelectSkill) => {
        const { id, title, icon } = skill;

        setDeletingId(id);

        confirmToast({
            title: `Delete "${title}"?`,
            description: 'This action cannot be undone!',
            confirmText: 'Delete',
            isLoading: deletingId === id && isPending,
            onConfirm: () => {
                mutate(undefined, {
                    onSuccess: async () => {
                        if (icon) {
                            await deleteFromCloudinary(icon);
                        }
                    },
                    onSettled: () => {
                        setDeletingId(null);
                    },
                });
            },
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Skills</h1>
                    <p className="text-muted-foreground">Manage your skills and technologies</p>
                </div>
                <Link href="/admin/skills/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Skill
                    </Button>
                </Link>
            </div>

            {skills.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="mb-4 text-muted-foreground">No skills yet</p>
                        <Link href={'/admin/skills/new'}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Skill
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {skills.map((skill) => (
                        <Card className="relative" key={skill.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-1 items-center gap-3">
                                        <Image
                                            alt={skill.title}
                                            className="rounded object-contain"
                                            height={40}
                                            src={buildCloudinaryUrl(skill.icon)}
                                            width={40}
                                        />
                                        <CardTitle className="text-base">
                                            {skill.title}
                                        </CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex gap-2">
                                    <Link className="flex-1" href={`/admin/skills/${skill.id}`}>
                                        <Button className="w-full" size="sm" variant="outline">
                                            <Pencil className="mr-2 h-3 w-3" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        disabled={deletingId === skill.id && isPending}
                                        loading={deletingId === skill.id && isPending}
                                        onClick={() => handleDelete(skill)}
                                        size="sm"
                                        variant="outline"
                                    >
                                        {(deletingId === skill.id && isPending) || (
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
