'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { httpRequest } from '@/lib/actions/baseRequest';
import { buildCloudinaryUrl } from '@/lib/utils';
import type { SelectProject } from '@/types/projects';

interface ProjectsClientProps {
    initialProjects: SelectProject[];
}

export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
    const router = useRouter();
    const [projects, setProjects] = useState(initialProjects);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = async (id: number, title: string) => {
        toast.custom(
            (t) => (
                <div className="flex items-center gap-3 rounded-lg border bg-background p-4 shadow-lg">
                    <div className="flex-1">
                        <p className="font-medium">Delete "{title}"?</p>
                        <p className="text-sm text-muted-foreground">
                            This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={async () => {
                                toast.dismiss(t);
                                setDeletingId(id);
                                try {
                                    await httpRequest(`/api/projects?id=${id}`, {
                                        method: 'DELETE',
                                    });
                                    setProjects(projects.filter((p) => p.id !== id));
                                    toast.success('Project deleted successfully');
                                    router.refresh();
                                } catch (error) {
                                    console.error('Failed to delete project:', error);
                                    toast.error('Failed to delete project');
                                } finally {
                                    setDeletingId(null);
                                }
                            }}
                            size="sm"
                            variant="destructive"
                        >
                            Delete
                        </Button>
                        <Button onClick={() => toast.dismiss(t)} size="sm" variant="outline">
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
                    <h1 className="text-3xl font-bold">Projects</h1>
                    <p className="text-muted-foreground">Manage your portfolio projects</p>
                </div>
                <Link href="/admin/projects/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
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
                                <Plus className="mr-2 h-4 w-4" />
                                Create Your First Project
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {projects.map((project) => (
                        <Card key={project.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Image
                                            alt={`${project.title} favicon`}
                                            className="rounded"
                                            height={32}
                                            src={buildCloudinaryUrl(project.favicon)}
                                            width={32}
                                        />
                                        <CardTitle className="text-lg">
                                            {project.title}
                                        </CardTitle>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/projects/${project.id}`}>
                                            <Button size="sm" variant="ghost">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            disabled={deletingId === project.id}
                                            onClick={() =>
                                                handleDelete(project.id, project.title)
                                            }
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
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

                                <div className="flex gap-2">
                                    <a
                                        className="text-sm text-primary hover:underline"
                                        href={project.live_link}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        Live Demo →
                                    </a>
                                    {project.repo_links[0] && (
                                        <>
                                            <span className="text-muted-foreground">•</span>
                                            <a
                                                className="text-sm text-primary hover:underline"
                                                href={project.repo_links[0]}
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >
                                                GitHub →
                                            </a>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
