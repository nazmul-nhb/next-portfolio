'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
import {
    type CloudinaryResponse,
    deleteFromCloudinary,
    uploadToCloudinary,
} from '@/lib/actions/cloudinary';
import { buildCloudinaryUrl } from '@/lib/utils';
import { ImageSchema } from '@/lib/zod-schema/files';
import { SkillCreationSchema, SkillUpdateSchema } from '@/lib/zod-schema/skills';
import type { InsertSkill, SelectSkill, UpdateSkill } from '@/types/skills';

// Form schema with FileList for icon
const SkillFormCreationSchema = SkillCreationSchema.omit({ icon: true }).extend({
    icon: ImageSchema,
});

const SkillFormUpdateSchema = SkillUpdateSchema.omit({ icon: true }).extend({
    icon: ImageSchema.optional(),
});

type SkillFormData = z.infer<typeof SkillFormCreationSchema>;
type SkillFormUpdateData = z.infer<typeof SkillFormUpdateSchema>;

interface SkillFormProps {
    onSubmit: (data: InsertSkill | UpdateSkill) => void;
    defaultValues?: SelectSkill;
    isLoading?: boolean;
}

export function SkillForm({ onSubmit, defaultValues, isLoading = false }: SkillFormProps) {
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const [iconRes, setIconRes] = useState<CloudinaryResponse>();

    const formSchema = defaultValues ? SkillFormUpdateSchema : SkillFormCreationSchema;

    const form = useForm<SkillFormData | SkillFormUpdateData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: defaultValues?.title || '',
        },
    });

    // Handle icon preview
    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setIconPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Form submission
    const handleSubmit = async (data: SkillFormData | SkillFormUpdateData) => {
        try {
            let iconUrl = defaultValues?.icon;

            // Only upload if new icon is provided
            if (data.icon) {
                const res = await uploadToCloudinary(data.icon, 'skill-icon');

                if (!isNotEmptyObject(res)) {
                    throw new Error('Failed to upload icon');
                }

                setIconRes(res);
                iconUrl = res.url;
            }

            // If updating and no new icon, use existing
            if (defaultValues && !data.icon) {
                iconUrl = defaultValues.icon;
            }

            const payload = {
                ...data,
                icon: iconUrl,
            };

            // Remove the FileList icon property before sending
            delete (payload as { icon?: FileList | string }).icon;
            (payload as InsertSkill).icon = iconUrl as string;

            if (defaultValues) {
                onSubmit(payload as UpdateSkill);
            } else {
                onSubmit(payload as InsertSkill);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            // Cleanup uploaded icon on error
            if (iconRes?.public_id) {
                await deleteFromCloudinary(iconRes.public_id);
            }
            throw error;
        }
    };

    // Initialize preview from default values
    useEffect(() => {
        if (defaultValues?.icon) {
            setIconPreview(buildCloudinaryUrl(defaultValues.icon));
        }
    }, [defaultValues]);

    return (
        <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
                {/* Title */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Skill Name *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., TypeScript, React, Node.js"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                The name of the skill or technology
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Icon Upload */}
                <FormField
                    control={form.control}
                    name="icon"
                    render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                            <FormLabel>Icon {!defaultValues && '*'}</FormLabel>
                            <FormControl>
                                <div className="space-y-4">
                                    <Input
                                        accept="image/*"
                                        className="cursor-pointer"
                                        onChange={(e) => {
                                            onChange(e.target.files);
                                            handleIconChange(e);
                                        }}
                                        type="file"
                                        {...field}
                                    />
                                    {iconPreview && (
                                        <div className="flex items-center gap-4">
                                            <div className="rounded-lg border border-border p-4">
                                                {/** biome-ignore lint/performance/noImgElement: it's for preview */}
                                                <img
                                                    alt="Icon preview"
                                                    className="h-12 w-12 object-contain"
                                                    src={iconPreview}
                                                />
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                <p>Preview</p>
                                                {defaultValues && (
                                                    <p className="text-xs">
                                                        (Leave empty to keep current icon)
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                            <FormDescription>
                                Upload an icon image (PNG, JPG, SVG, or GIF, max 2MB)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-4">
                    <Button disabled={isLoading} type="submit">
                        {isLoading
                            ? 'Saving...'
                            : defaultValues
                              ? 'Update Skill'
                              : 'Create Skill'}
                    </Button>
                    <Button
                        disabled={isLoading}
                        onClick={() => form.reset()}
                        type="button"
                        variant="outline"
                    >
                        Reset
                    </Button>
                </div>
            </form>
        </Form>
    );
}
