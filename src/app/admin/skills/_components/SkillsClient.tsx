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
import { useCallback, useEffect, useRef, useState } from 'react';
import SortableSkillCard from '@/app/admin/skills/_components/SortableSkillCard';
import { confirmToast } from '@/components/confirm';
import { SkillForm } from '@/components/forms/skill-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { deleteFromCloudinary, deleteOldCloudFile } from '@/lib/actions/cloudinary';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import type { ReorderItem } from '@/types';
import type { InsertSkill, SelectSkill, UpdateSkill } from '@/types/skills';

interface Props {
    initialData: SelectSkill[];
}

export function SkillsClient({ initialData }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [orderedSkills, setOrderedSkills] = useState<SelectSkill[]>(initialData);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<SelectSkill | null>(null);
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

    const { mutate: createSkill, isPending: isCreating } = useApiMutation<
        SelectSkill,
        InsertSkill
    >('/api/skills', 'POST', {
        successMessage: 'Skill created successfully!',
        errorMessage: 'Failed to create skill.',
        invalidateKeys: ['skills'],
        onSuccess: () => setDialogOpen(false),
    });

    const { mutate: updateSkill, isPending: isUpdating } = useApiMutation<
        SelectSkill,
        UpdateSkill
    >(`/api/skills?id=${editingSkill?.id}`, 'PATCH', {
        successMessage: 'Skill updated successfully!',
        errorMessage: 'Failed to update skill.',
        invalidateKeys: ['skills'],
    });

    const handleAdd = () => {
        setEditingSkill(null);
        setDialogOpen(true);
    };

    const handleEdit = (skill: SelectSkill) => {
        setEditingSkill(skill);
        setDialogOpen(true);
    };

    const handleCreateSubmit = (data: InsertSkill) => {
        createSkill(data);
    };

    const handleEditSubmit = (data: UpdateSkill) => {
        if (!editingSkill) return;
        updateSkill(data, {
            onSuccess: async () => {
                await deleteOldCloudFile(editingSkill.icon, data.icon);
                setDialogOpen(false);
                setEditingSkill(null);
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
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Skill
                </Button>
            </div>

            {orderedSkills.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="mb-4 text-muted-foreground">No skills yet</p>
                        <Button onClick={handleAdd}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Skill
                        </Button>
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
                                    onEdit={handleEdit}
                                    skill={skill}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Add/Edit Skill Dialog */}
            <Dialog
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setEditingSkill(null);
                }}
                open={dialogOpen}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSkill ? 'Edit Skill' : 'Add New Skill'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingSkill
                                ? 'Update skill details.'
                                : 'Add a new skill to your profile.'}
                        </DialogDescription>
                    </DialogHeader>
                    <SkillForm
                        defaultValues={editingSkill ?? undefined}
                        isLoading={isCreating || isUpdating}
                        key={editingSkill?.id ?? 'new'}
                        onSubmit={editingSkill ? handleEditSubmit : handleCreateSubmit}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
