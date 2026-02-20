'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const CategoryFormSchema = z.object({
    title: z
        .string()
        .min(2, 'Category name must be at least 2 characters')
        .max(128, 'Category name must be at most 128 characters'),
});

type CategoryFormData = z.infer<typeof CategoryFormSchema>;

interface CategoryFormProps {
    onSubmit: (data: CategoryFormData) => void;
    defaultValues?: { title: string };
    isLoading?: boolean;
}

export function CategoryForm({
    onSubmit,
    defaultValues,
    isLoading = false,
}: CategoryFormProps) {
    const form = useForm<CategoryFormData>({
        resolver: zodResolver(CategoryFormSchema),
        defaultValues: {
            title: defaultValues?.title || '',
        },
    });

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category Name *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Web Development, DevOps, Design"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>The name of the blog category</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2">
                    <Button disabled={isLoading} loading={isLoading} type="submit">
                        {defaultValues ? 'Update Category' : 'Create Category'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
