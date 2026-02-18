'use client';

import { MessageSquareQuote, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { confirmToast } from '@/components/confirm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteFromCloudinary } from '@/lib/actions/cloudinary';
import { useApiMutation, useApiQuery } from '@/lib/hooks/use-api';
import { buildCloudinaryUrl } from '@/lib/utils';
import type { SelectTestimonial } from '@/types/testimonials';

interface Props {
    initialData: SelectTestimonial[];
}

export function TestimonialsClient({ initialData }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data: testimonials = initialData } = useApiQuery<SelectTestimonial[]>(
        ['testimonials'],
        '/api/testimonials'
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Testimonials</h1>
                    <p className="text-muted-foreground">
                        Manage client testimonials and feedback
                    </p>
                </div>
                <Link href="/admin/testimonials/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Testimonial
                    </Button>
                </Link>
            </div>

            {testimonials.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <MessageSquareQuote className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="mb-4 text-muted-foreground">No testimonials yet</p>
                        <Link href="/admin/testimonials/new">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
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
                                    <div className="flex gap-4">
                                        {testimonial.client_avatar && (
                                            <div className="h-12 w-12 overflow-hidden rounded-full border">
                                                <Image
                                                    alt={testimonial.client_name}
                                                    className="object-cover"
                                                    height={48}
                                                    src={buildCloudinaryUrl(
                                                        testimonial.client_avatar
                                                    )}
                                                    width={48}
                                                />
                                            </div>
                                        )}
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
                                            <div className="mt-1 flex gap-1">
                                                {Array.from({ length: 5 }).map((_, idx) => (
                                                    <Star
                                                        className={`size-4 ${
                                                            idx < testimonial.rating
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                        key={idx}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/testimonials/${testimonial.id}`}>
                                            <Button size="icon" variant="outline">
                                                <Pencil className="h-4 w-4" />
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
                                                <Trash2 className="h-4 w-4" />
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
