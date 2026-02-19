'use client';

import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import SortableSkillCard from '@/app/admin/skills/_components/SortableSkillCard';
import { confirmToast } from '@/components/confirm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { deleteFromCloudinary } from '@/lib/actions/cloudinary';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import type { ReorderItem } from '@/types';
import type { SelectSkill } from '@/types/skills';

interface Props {
    initialData: SelectSkill[];
}

export function SkillsClient({ initialData }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [orderedSkills, setOrderedSkills] = useState<SelectSkill[]>(initialData);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { data: skills } = useApiQuery<SelectSkill[]>('skills', '/api/skills');

    // Sync query data into local state when it updates (but not during drag)
    useEffect(() => {
        if (skills) {
            setOrderedSkills(skills);
        }
    }, [skills]);

    const { mutate: deleteSkill, isPending: isDeleting } = useApiMutation<{ id: number }, null>(
        `/api/skills?id=${deletingId}`,
        'DELETE',
        {
            successMessage: 'Skill deleted successfully!',
            errorMessage: 'Failed to delete skill. Please try again.',
            invalidateKeys: ['skills'],
            onError: (error) => {
                console.error('Failed to delete skill:', error);
            },
        }
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const { mutate: reorder, isPending: isReordering } = useApiMutation<
        { reordered: number },
        ReorderItem[]
    >('/api/skills/reorder', 'PUT', {
        successMessage: 'Skill order saved!',
        errorMessage: 'Failed to save skill order. Please try again.',
        invalidateKeys: ['skills'],
    });

    /** Persist reordered skills to the server (debounced) */
    const saveOrder = useCallback(
        (reordered: SelectSkill[]) => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            saveTimeoutRef.current = setTimeout(async () => {
                const items: ReorderItem[] = reordered.map((skill, idx) => ({
                    id: skill.id,
                    sort_order: idx + 1,
                }));

                reorder(items);
            }, 700);
        },
        [reorder]
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;

            if (over && active.id !== over.id) {
                setOrderedSkills((prev) => {
                    const oldIndex = prev.findIndex((s) => s.id === active.id);
                    const newIndex = prev.findIndex((s) => s.id === over.id);
                    const reordered = arrayMove(prev, oldIndex, newIndex);
                    saveOrder(reordered);
                    return reordered;
                });
            }
        },
        [saveOrder]
    );

    const handleDelete = async (skill: SelectSkill) => {
        const { id, title, icon } = skill;

        setDeletingId(id);

        confirmToast({
            title: `Delete "${title}"?`,
            description: 'This action cannot be undone!',
            confirmText: 'Delete',
            isLoading: deletingId === id && isDeleting,
            onConfirm: () => {
                deleteSkill(null, {
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
                    <p className="text-muted-foreground">
                        Manage your skills and technologies
                        {isReordering && (
                            <span className="ml-2 text-xs text-primary">(saving order...)</span>
                        )}
                    </p>
                </div>
                <Link href="/admin/skills/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Skill
                    </Button>
                </Link>
            </div>

            {orderedSkills.length === 0 ? (
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
                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                >
                    <SortableContext
                        items={orderedSkills.map((s) => s.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {orderedSkills.map((skill) => (
                                <SortableSkillCard
                                    deletingId={deletingId}
                                    isPending={isDeleting}
                                    key={skill.id}
                                    onDelete={handleDelete}
                                    skill={skill}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}
