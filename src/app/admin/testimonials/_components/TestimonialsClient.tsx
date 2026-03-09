'use client';

import { MessageSquareQuote, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { confirmToast } from '@/components/misc/confirm';
import RatingStars from '@/components/misc/rating-stars';
import UserAvatar from '@/components/misc/user-avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteFromCloudinary } from '@/lib/actions/cloudinary';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import type { SelectTestimonial } from '@/types/testimonials';

interface Props {
    initialData: SelectTestimonial[];
}

export function TestimonialsClient({ initialData }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data: testimonials = initialData } = useApiQuery<SelectTestimonial[]>(
        '/api/testimonials',
        {
            queryKey: ['testimonials'],
        }
    );

    const { mutate, isPending } = useApiMutation<{ id: number }, undefined>(
        `/api/testimonials?id=${deletingId}`,
        'DELETE',
        {
            successMessage: 'Testimonial deleted successfully!',
            errorMessage: 'Failed to delete testimonial. Please try again.',
            invalidateKeys: ['testimonials'],
            onError: (error) => {
                console.error('Failed to delete testimonial:', error);
            },
        }
    );

    const handleDelete = (testimonial: SelectTestimonial) => {
        const { client_avatar, client_name, id } = testimonial;

        setDeletingId(id);

        confirmToast({
            title: `Delete testimonial from "${client_name}"?`,
            description: 'This action cannot be undone!',
            confirmText: 'Delete',
            isLoading: deletingId === id && isPending,
            onConfirm: () => {
                mutate(undefined, {
                    onSuccess: async () => {
                        if (client_avatar) {
                            await deleteFromCloudinary(client_avatar);
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
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Testimonials</h1>
                    <p className="text-muted-foreground">
                        Manage client testimonials and feedback
                    </p>
                </div>
                <Link href="/admin/testimonials/new">
                    <Button>
                        <Plus className="size-4" />
                        Add Testimonial
                    </Button>
                </Link>
            </div>

            {testimonials.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <MessageSquareQuote className="mb-4 size-12 text-muted-foreground" />
                        <p className="mb-4 text-muted-foreground">No testimonials yet</p>
                        <Link href="/admin/testimonials/new">
                            <Button>
                                <Plus className="size-4" />
                                Add Your First Testimonial
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {testimonials.map((testimonial) => (
                        <Card key={testimonial.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start justify-start gap-2">
                                        <UserAvatar
                                            className="size-9 md:size-12 mt-2 md:mt-0"
                                            image={testimonial.client_avatar}
                                            name={testimonial.client_name}
                                        />
                                        <div>
                                            <CardTitle className="text-xl">
                                                {testimonial.client_name}
                                            </CardTitle>
                                            {testimonial.client_role && (
                                                <p className="text-sm text-muted-foreground">
                                                    {testimonial.client_role}
                                                    {testimonial.client_company &&
                                                        ` at ${testimonial.client_company}`}
                                                </p>
                                            )}
                                            <RatingStars
                                                className="mt-1"
                                                rating={testimonial.rating}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/testimonials/${testimonial.id}`}>
                                            <Button size="icon" variant="outline">
                                                <Pencil className="size-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            disabled={
                                                deletingId === testimonial.id && isPending
                                            }
                                            loading={deletingId === testimonial.id && isPending}
                                            onClick={() => handleDelete(testimonial)}
                                            size="icon"
                                            variant="destructive"
                                        >
                                            {(deletingId === testimonial.id && isPending) || (
                                                <Trash2 className="size-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm italic">"{testimonial.content}"</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
