'use client';

import { Calendar, CalendarCheck, Pencil, Plus, Trash2 } from 'lucide-react';
import { formatDate } from 'nhb-toolbox';
import { useState } from 'react';
import { CategoryForm } from '@/components/forms/category-form';
import { confirmToast } from '@/components/misc/confirm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import type { SelectCategory } from '@/types/blogs';

export function CategoriesClient({ initialData }: { initialData: SelectCategory[] }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<SelectCategory | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data: categories = initialData } = useApiQuery<SelectCategory[]>(
        '/api/categories',
        {
            queryKey: ['categories'],
        }
    );

    const { mutate: createCategory, isPending: isCreating } = useApiMutation<
        SelectCategory,
        { title: string }
    >('/api/categories', 'POST', {
        successMessage: 'Category created successfully!',
        errorMessage: 'Failed to create category.',
        invalidateKeys: ['categories'],
        onSuccess: () => setDialogOpen(false),
    });

    const { mutate: updateCategory, isPending: isUpdating } = useApiMutation<
        SelectCategory,
        { title: string }
    >(`/api/categories/${editingCategory?.id}`, 'PATCH', {
        successMessage: 'Category updated successfully!',
        errorMessage: 'Failed to update category.',
        invalidateKeys: ['categories'],
        onSuccess: () => {
            setDialogOpen(false);
            setEditingCategory(null);
        },
    });

    const { mutate: deleteCategory, isPending: isDeleting } = useApiMutation<
        SelectCategory,
        null
    >(`/api/categories/${deletingId}`, 'DELETE', {
        successMessage: 'Category deleted successfully!',
        errorMessage: 'Failed to delete category.',
        invalidateKeys: ['categories'],
    });

    const handleCreate = () => {
        setEditingCategory(null);
        setDialogOpen(true);
    };

    const handleEdit = (category: SelectCategory) => {
        setEditingCategory(category);
        setDialogOpen(true);
    };

    const handleDelete = (category: SelectCategory) => {
        setDeletingId(category.id);

        confirmToast({
            title: `Delete "${category.title}"?`,
            description: 'This will remove the category from all associated blogs.',
            confirmText: 'Delete',
            isLoading: deletingId === category.id && isDeleting,
            onConfirm: () => {
                deleteCategory(null, {
                    onSettled: () => setDeletingId(null),
                });
            },
        });
    };

    const handleSubmit = (data: { title: string }) => {
        if (editingCategory) {
            updateCategory(data);
        } else {
            createCategory(data);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Categories</h1>
                    <p className="text-muted-foreground">Manage blog categories</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="size-4" />
                    Add Category
                </Button>
            </div>

            {categories.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="mb-4 text-muted-foreground">No categories yet</p>
                        <Button onClick={handleCreate}>
                            <Plus className="size-4" />
                            Add Your First Category
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {categories.map((category) => (
                        <Card className="relative" key={category.id}>
                            <CardContent className="flex items-center justify-between p-4">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">{category.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        /{category.slug}
                                    </p>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                    <Button
                                        onClick={() => handleEdit(category)}
                                        size="icon"
                                        variant="ghost"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        disabled={deletingId === category.id && isDeleting}
                                        loading={deletingId === category.id && isDeleting}
                                        onClick={() => handleDelete(category)}
                                        size="icon"
                                        variant="ghost"
                                    >
                                        {(deletingId === category.id && isDeleting) || (
                                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter className="px-4 flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
                                <p className="flex gap-1 items-center">
                                    <Calendar className="size-3" />
                                    {formatDate({
                                        date: category.created_at,
                                        format: 'mmm DD, YYYY hh:mm a',
                                    })}
                                </p>
                                <p className="flex gap-1 items-center">
                                    <CalendarCheck className="size-3" />
                                    {formatDate({
                                        date: category.updated_at,
                                        format: 'mmm DD, YYYY hh:mm a',
                                    })}
                                </p>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setEditingCategory(null);
                }}
                open={dialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Edit Category' : 'New Category'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory
                                ? 'Update the category name.'
                                : 'Add a new blog category.'}
                        </DialogDescription>
                    </DialogHeader>
                    <CategoryForm
                        defaultValues={
                            editingCategory ? { title: editingCategory.title } : undefined
                        }
                        isLoading={isCreating || isUpdating}
                        key={editingCategory?.id ?? 'new'}
                        onSubmit={handleSubmit}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
