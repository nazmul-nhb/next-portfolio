/** biome-ignore-all lint/performance/noImgElement: this is for image preview during upload */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Star } from 'lucide-react';
import { isNotEmptyObject } from 'nhb-toolbox';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import {
    type CloudinaryResponse,
    deleteFromCloudinary,
    uploadToCloudinary,
} from '@/lib/actions/cloudinary';
import { buildCloudinaryUrl } from '@/lib/utils';
import {
    TestimonialFormSchema,
    TestimonialFormUpdateSchema,
} from '@/lib/zod-schema/testimonials';
import type {
    InsertTestimonial,
    SelectTestimonial,
    UpdateTestimonial,
} from '@/types/testimonials';

type TestimonialFormData = z.infer<typeof TestimonialFormSchema>;
type TestimonialFormUpdateData = z.infer<typeof TestimonialFormUpdateSchema>;

interface TestimonialFormProps {
    onSubmit: ((data: UpdateTestimonial) => void) | ((data: InsertTestimonial) => void);
    defaultValues?: SelectTestimonial;
    isLoading?: boolean;
}

export function TestimonialForm({
    onSubmit,
    defaultValues,
    isLoading = false,
}: TestimonialFormProps) {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarRes, setAvatarRes] = useState<CloudinaryResponse>();
    const [rating, setRating] = useState(defaultValues?.rating || 5);
    const [isUploading, setIsUploading] = useState(false);

    const formSchema = defaultValues ? TestimonialFormUpdateSchema : TestimonialFormSchema;

    const form = useForm<TestimonialFormData | TestimonialFormUpdateData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            client_name: defaultValues?.client_name || '',
            client_role: defaultValues?.client_role || '',
            client_company: defaultValues?.client_company || '',
            content: defaultValues?.content || '',
            rating: defaultValues?.rating || 5,
        },
    });

    // Handle avatar preview
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Form submission
    const handleSubmit = async (data: TestimonialFormData | TestimonialFormUpdateData) => {
        try {
            setIsUploading(true);

            let avatarUrl = defaultValues?.client_avatar;

            // Only upload if new avatar is provided
            if (data.client_avatar) {
                const res = await uploadToCloudinary(data.client_avatar, 'testimonial-avatar');

                if (!isNotEmptyObject(res)) {
                    throw new Error('Failed to upload avatar');
                }

                setAvatarRes(res);
                avatarUrl = res.url;
            }

            const payload = {
                ...data,
                client_avatar: avatarUrl,
                rating,
            };

            onSubmit(payload as InsertTestimonial);
        } catch (error) {
            console.error('Form submission error:', error);
            // Cleanup uploaded avatar on error
            if (avatarRes?.public_id) {
                await deleteFromCloudinary(avatarRes.public_id);
            }
        } finally {
            setIsUploading(false);
        }
    };

    // Initialize preview from default values
    useEffect(() => {
        if (defaultValues?.client_avatar) {
            setAvatarPreview(buildCloudinaryUrl(defaultValues.client_avatar));
        }
    }, [defaultValues]);

    return (
        <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
                {/* Client Name */}
                <FormField
                    control={form.control}
                    name="client_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Client Name *</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Client Role */}
                <FormField
                    control={form.control}
                    name="client_role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role/Position</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., CEO"
                                    {...field}
                                    value={field.value || ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Client Company */}
                <FormField
                    control={form.control}
                    name="client_company"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Tech Corp"
                                    {...field}
                                    value={field.value || ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Content */}
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Testimonial Content *</FormLabel>
                            <FormControl>
                                <Textarea
                                    className="min-h-32"
                                    placeholder="Write the testimonial..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Rating */}
                <div className="space-y-2">
                    <FormLabel>Rating *</FormLabel>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                className="transition-colors"
                                key={star}
                                onClick={() => setRating(star)}
                                type="button"
                            >
                                <Star
                                    className={`h-6 w-6 ${
                                        star <= rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-muted-foreground'
                                    }`}
                                />
                            </button>
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">{rating} / 5</span>
                    </div>
                </div>

                {/* Avatar Upload */}
                <FormField
                    control={form.control}
                    name="client_avatar"
                    render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                            <FormLabel>Client Avatar (Optional)</FormLabel>
                            <FormControl>
                                <div className="space-y-4">
                                    <Input
                                        accept="image/*"
                                        className="cursor-pointer"
                                        onChange={(e) => {
                                            onChange(e.target.files);
                                            handleAvatarChange(e);
                                        }}
                                        type="file"
                                        {...field}
                                    />
                                    {avatarPreview && (
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 overflow-hidden rounded-full border border-border">
                                                <img
                                                    alt="Avatar preview"
                                                    className="h-full w-full object-cover"
                                                    src={avatarPreview}
                                                />
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                <p>Preview</p>
                                                {defaultValues && (
                                                    <p className="text-xs">
                                                        (Leave empty to keep current avatar)
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                            <FormDescription>Upload client avatar (max 2MB)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    disabled={isLoading || isUploading}
                    loading={isLoading || isUploading}
                    type="submit"
                >
                    {defaultValues ? 'Update Testimonial' : 'Create Testimonial'}
                </Button>
            </form>
        </Form>
    );
}
