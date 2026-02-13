'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ENV } from '@/configs/env';
import { httpRequest } from '@/lib/actions/baseRequest';
import type { SelectSkill } from '@/types/skills';

interface SkillsClientProps {
    initialSkills: SelectSkill[];
}

export function SkillsClient({ initialSkills }: SkillsClientProps) {
    const router = useRouter();
    const [skills, setSkills] = useState(initialSkills);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = async (id: number, title: string) => {
        toast.custom(
            (toastId) => (
                <div className="flex items-center gap-3 rounded-lg border bg-background p-4 shadow-lg">
                    <div className="flex-1">
                        <p className="font-medium">Delete "{title}"?</p>
                        <p className="text-sm text-muted-foreground">This cannot be undone!</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={async () => {
                                toast.dismiss(toastId);
                                setDeletingId(id);
                                try {
                                    await httpRequest(`/api/skills?id=${id}`, {
                                        method: 'DELETE',
                                    });
                                    setSkills(skills.filter((s) => s.id !== id));
                                    toast.success('Skill deleted successfully');
                                    router.refresh();
                                } catch (error) {
                                    console.error('Failed to delete skill:', error);
                                    toast.error('Failed to delete skill');
                                } finally {
                                    setDeletingId(null);
                                }
                            }}
                            size="sm"
                            variant="destructive"
                        >
                            Delete
                        </Button>
                        <Button
                            onClick={() => toast.dismiss(toastId)}
                            size="sm"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            ),
            { duration: 5000 }
        );
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
                                            src={ENV.cloudinary.urls.base_url + skill.icon}
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
                                        disabled={deletingId === skill.id}
                                        onClick={() => handleDelete(skill.id, skill.title)}
                                        size="sm"
                                        variant="outline"
                                    >
                                        <Trash2 className="h-3 w-3 text-destructive" />
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
