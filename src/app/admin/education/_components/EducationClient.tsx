'use client';

import { GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ENV } from '@/configs/env';
import { httpRequest } from '@/lib/actions/baseRequest';
import type { SelectEducation } from '@/types/career';

interface EducationClientProps {
    initialEducation: SelectEducation[];
}

export function EducationClient({ initialEducation }: EducationClientProps) {
    const router = useRouter();
    const [education, setEducation] = useState(initialEducation);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = async (id: number, degree: string) => {
        if (!confirm(`Are you sure you want to delete "${degree}"?`)) return;

        setDeletingId(id);
        try {
            await httpRequest(`/api/education?id=${id}`, {
                method: 'DELETE',
            });

            setEducation(education.filter((e) => e.id !== id));
            router.refresh();
            toast.success('Education deleted successfully');
        } catch (error) {
            console.error('Failed to delete education:', error);
            toast.error('Failed to delete education. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Present';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Education</h1>
                    <p className="text-muted-foreground">Manage your education history</p>
                </div>
                <Link href="/admin/education/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Education
                    </Button>
                </Link>
            </div>

            {education.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="mb-4 text-muted-foreground">No education entries yet</p>
                        <Link href="/admin/education/new">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Education
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {education.map((edu) => (
                        <Card key={edu.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        {edu.institution_logo && (
                                            <div className="h-12 w-12 overflow-hidden rounded-lg border">
                                                <Image
                                                    alt={edu.institution}
                                                    className="object-contain"
                                                    height={48}
                                                    src={`${ENV.cloudinary.urls.base_url}${edu.institution_logo}`}
                                                    width={48}
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <CardTitle className="text-xl">
                                                {edu.degree}
                                            </CardTitle>
                                            <p className="text-muted-foreground">
                                                {edu.institution} • {edu.location}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(edu.start_date)} -{' '}
                                                {formatDate(edu.end_date)}
                                            </p>
                                            {edu.grade && (
                                                <p className="text-sm font-medium text-primary">
                                                    Grade: {edu.grade}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/education/${edu.id}` as '/'}>
                                            <Button size="icon" variant="outline">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            disabled={deletingId === edu.id}
                                            onClick={() => handleDelete(edu.id, edu.degree)}
                                            size="icon"
                                            variant="destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {edu.description && (
                                    <p className="text-sm">{edu.description}</p>
                                )}
                                {edu.achievements && edu.achievements.length > 0 && (
                                    <div>
                                        <p className="mb-2 text-sm font-medium">
                                            Key Achievements:
                                        </p>
                                        <ul className="list-inside list-disc space-y-1 text-sm">
                                            {edu.achievements.map((achievement, idx) => (
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
