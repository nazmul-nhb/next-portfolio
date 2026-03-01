'use client';

import { Briefcase, Pencil, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { confirmToast } from '@/components/misc/confirm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteFromCloudinary } from '@/lib/actions/cloudinary';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { buildCloudinaryUrl, formatDuration } from '@/lib/utils';
import type { SelectExperience } from '@/types/career';

interface ExperiencesClientProps {
    initialExperiences: SelectExperience[];
}

export function ExperiencesClient({ initialExperiences }: ExperiencesClientProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data: experiences = initialExperiences } = useApiQuery<SelectExperience[]>(
        '/api/experiences',
        {
            queryKey: ['experiences'],
        }
    );

    const { mutate: deleteExp } = useApiMutation<SelectExperience>(
        `/api/experiences?id=${deletingId}`,
        'DELETE',
        {
            successMessage: 'Experience deleted successfully',
            errorMessage: 'Failed to delete experience',
            invalidateKeys: ['experiences'],
            onError: (error) => console.error('Failed to delete experience:', error),
        }
    );

    const handleDelete = async (exp: SelectExperience) => {
        const { position, id, company_logo } = exp;

        confirmToast({
            onConfirm: () => {
                setDeletingId(id);
                deleteExp(null, {
                    onSuccess: async () => {
                        if (company_logo) {
                            await deleteFromCloudinary(company_logo);
                        }
                    },
                    onSettled: () => setDeletingId(null),
                });
            },
            title: `Delete "${position}"?`,
            description: 'This action cannot be undone!',
            confirmText: 'Delete',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Experience</h1>
                    <p className="text-muted-foreground">Manage your work experience</p>
                </div>
                <Link href="/admin/experience/new">
                    <Button>
                        <Plus className="size-4" />
                        Add Experience
                    </Button>
                </Link>
            </div>

            {experiences.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Briefcase className="mb-4 size-12 text-muted-foreground" />
                        <p className="mb-4 text-muted-foreground">No experience entries yet</p>
                        <Link href="/admin/experience/new">
                            <Button>
                                <Plus className="size-4" />
                                Add Your First Experience
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {experiences.map((exp) => (
                        <Card key={exp.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start justify-start gap-2">
                                        {exp.company_logo && (
                                            <div className="size-8 sm:size-10 md:size-12 shrink-0 overflow-hidden">
                                                <Image
                                                    alt={exp.company}
                                                    className="size-8 sm:size-10 md:size-12 aspect-square object-contain"
                                                    height={48}
                                                    src={buildCloudinaryUrl(exp.company_logo)}
                                                    width={48}
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <CardTitle className="text-xl">
                                                {exp.position}
                                            </CardTitle>
                                            <p className="text-muted-foreground">
                                                {exp.company} • {exp.location}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDuration(exp.start_date, exp.end_date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/experience/${exp.id}`}>
                                            <Button size="icon" variant="outline">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            disabled={deletingId === exp.id}
                                            onClick={() => handleDelete(exp)}
                                            size="icon"
                                            variant="destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {exp.description && (
                                    <p className="text-sm">{exp.description}</p>
                                )}
                                {exp.technologies && exp.technologies.length > 0 && (
                                    <div>
                                        <p className="mb-2 text-sm font-medium">
                                            Technologies:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {exp.technologies.map((tech, idx) => (
                                                <span
                                                    className="rounded-full bg-primary/10 px-3 py-1 text-xs"
                                                    key={idx}
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {exp.achievements && exp.achievements.length > 0 && (
                                    <div>
                                        <p className="mb-2 text-sm font-medium">
                                            Key Achievements:
                                        </p>
                                        <ul className="list-inside list-disc space-y-1 text-sm">
                                            {exp.achievements.map((achievement, idx) => (
                                                <li key={idx}>{achievement}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
