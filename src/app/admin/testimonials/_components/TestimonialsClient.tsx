'use client';

import { MessageSquareQuote, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ENV } from '@/configs/env';
import { httpRequest } from '@/lib/actions/baseRequest';
import type { SelectTestimonial } from '@/types/testimonials';

interface TestimonialsClientProps {
    initialTestimonials: SelectTestimonial[];
}

export function TestimonialsClient({ initialTestimonials }: TestimonialsClientProps) {
    const router = useRouter();
    const [testimonials, setTestimonials] = useState(initialTestimonials);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = async (id: number, clientName: string) => {
        toast.custom(
            (t) => (
                <div className="flex items-center gap-3 rounded-lg border bg-background p-4 shadow-lg">
                    <div className="flex-1">
                        <p className="font-medium">Delete testimonial from "{clientName}"?</p>
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
                                    await httpRequest(`/api/testimonials?id=${id}`, {
                                        method: 'DELETE',
                                    });
                                    setTestimonials(testimonials.filter((t) => t.id !== id));
                                    toast.success('Testimonial deleted successfully');
                                    router.refresh();
                                } catch (error) {
                                    console.error('Failed to delete testimonial:', error);
                                    toast.error('Failed to delete testimonial');
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
                                                    src={`${ENV.cloudinary.urls.base_url}${testimonial.client_avatar}`}
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
                                                        className={`h-4 w-4 ${
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
                                        <Link
                                            href={
                                                `/admin/testimonials/${testimonial.id}` as '/'
                                            }
                                        >
                                            <Button size="icon" variant="outline">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            disabled={deletingId === testimonial.id}
                                            onClick={() =>
                                                handleDelete(
                                                    testimonial.id,
                                                    testimonial.client_name
                                                )
                                            }
                                            size="icon"
                                            variant="destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
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
