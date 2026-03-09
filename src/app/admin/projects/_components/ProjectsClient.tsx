'use client';

import { Globe, Pencil, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { FaGitAlt } from 'react-icons/fa';
import { confirmToast } from '@/components/misc/confirm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteFromCloudinary } from '@/lib/actions/cloudinary';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { buildCloudinaryUrl, eliminateEmptyStrings } from '@/lib/utils';
import type { SelectProject } from '@/types/projects';

interface ProjectsClientProps {
    initialProjects: SelectProject[];
}

export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data: projects = initialProjects } = useApiQuery<SelectProject[]>('/api/projects', {
        queryKey: ['projects'],
    });

    const { mutate: deleteProject } = useApiMutation<SelectProject>(
        `/api/projects?id=${deletingId}`,
        'DELETE',
        {
            successMessage: 'Project deleted successfully',
            errorMessage: 'Failed to delete project',
            invalidateKeys: ['projects'],
            onError: (error) => console.error('Failed to delete project:', error),
        }
    );

    const handleDelete = async (project: SelectProject) => {
        const { id, title, favicon, screenshots } = project;

        confirmToast({
            onConfirm: () => {
                setDeletingId(id);
                deleteProject(null, {
                    onSuccess: async () => {
                        await Promise.all(
                            [favicon, ...screenshots].map((publicId) => {
                                return deleteFromCloudinary(publicId);
                            })
                        );
                    },
                    onSettled: () => setDeletingId(null),
                });
            },
            title: `Delete "${title}"?`,
            description: 'This action cannot be undone!',
            confirmText: 'Delete',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Projects</h1>
                    <p className="text-muted-foreground">Manage your portfolio projects</p>
                </div>
                <Link href="/admin/projects/new">
                    <Button>
                        <Plus className="size-4" />
                        Add Project
                    </Button>
                </Link>
            </div>

            {projects.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="mb-4 text-muted-foreground">No projects yet</p>
                        <Link href={'/admin/projects/new'}>
                            <Button>
                                <Plus className="size-4" />
                                Create Your First Project
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {projects.map((project) => {
                        const repositories = eliminateEmptyStrings(project.repo_links);

                        return (
                            <Card key={project.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Image
                                                alt={project.title}
                                                className="rounded"
                                                height={32}
                                                src={buildCloudinaryUrl(project.favicon)}
                                                width={32}
                                            />
                                            <CardTitle className="text-lg">
                                                <Link
                                                    className="hover:text-primary hover:underline"
                                                    href={`/projects/${project.id}`}
                                                >
                                                    {project.title}
                                                </Link>
                                            </CardTitle>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/admin/projects/${project.id}`}>
                                                <Button size="sm" variant="ghost">
                                                    <Pencil className="size-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                disabled={deletingId === project.id}
                                                onClick={() => handleDelete(project)}
                                                size="sm"
                                                variant="ghost"
                                            >
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                        {project.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {project.tech_stack.slice(0, 4).map((tech) => (
                                            <span
                                                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                                key={tech}
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                        {project.tech_stack.length > 4 && (
                                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                                +{project.tech_stack.length - 4} more
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-2 text-xs text-muted-foreground">
                                        <span>{project.features.length} features</span>
                                        <span>•</span>
                                        <span>{project.screenshots.length} screenshots</span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <a
                                            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                                            href={project.live_link}
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        >
                                            <Globe className="size-4 mb-px" /> Live Demo →
                                        </a>
                                        {repositories.map((repoLink, idx) => {
                                            return (
                                                <Fragment key={`${repoLink}-${idx}`}>
                                                    <span className="text-muted-foreground">
                                                        •
                                                    </span>
                                                    <a
                                                        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                                                        href={repoLink}
                                                        rel="noopener noreferrer"
                                                        target="_blank"
                                                    >
                                                        <FaGitAlt className="size-4 mb-px" />
                                                        {repositories.length > 1
                                                            ? `Repo ${idx + 1}`
                                                            : 'Source Code'}
                                                    </a>
                                                </Fragment>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
