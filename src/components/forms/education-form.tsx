/** biome-ignore-all lint/performance/noImgElement: this is for image preview during upload */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
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
import { EducationFormSchema, EducationFormUpdateSchema } from '@/lib/zod-schema/career';
import type { InsertEducation, SelectEducation, UpdateEducation } from '@/types/career';

type EducationFormData = z.infer<typeof EducationFormSchema>;
type EducationFormUpdateData = z.infer<typeof EducationFormUpdateSchema>;

interface EducationFormProps {
    onSubmit: (data: InsertEducation | UpdateEducation) => void;
    defaultValues?: SelectEducation;
    isLoading?: boolean;
}

export function EducationForm({
    onSubmit,
    defaultValues,
    isLoading = false,
}: EducationFormProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoRes, setLogoRes] = useState<CloudinaryResponse>();
    const [achievements, setAchievements] = useState<string[]>(
        defaultValues?.achievements || ['']
    );

    const formSchema = defaultValues ? EducationFormUpdateSchema : EducationFormSchema;

    const form = useForm<EducationFormData | EducationFormUpdateData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            degree: defaultValues?.degree || '',
            institution: defaultValues?.institution || '',
            location: defaultValues?.location || '',
            start_date: defaultValues?.start_date || '',
            end_date: defaultValues?.end_date || '',
            grade: defaultValues?.grade || '',
            description: defaultValues?.description || '',
            achievements: defaultValues?.achievements || [],
        },
    });

    // Handle logo preview
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Achievements handlers
    const handleAddAchievement = () => {
        setAchievements([...achievements, '']);
    };

    const handleRemoveAchievement = (index: number) => {
        if (achievements.length > 1) {
            const newAchievements = achievements.filter((_, i) => i !== index);
            setAchievements(newAchievements);
            form.setValue('achievements', newAchievements);
        }
    };

    const handleAchievementChange = (index: number, value: string) => {
        const newAchievements = [...achievements];
        newAchievements[index] = value;
        setAchievements(newAchievements);
        form.setValue('achievements', newAchievements);
    };

    // Form submission
    const handleSubmit = async (data: EducationFormData | EducationFormUpdateData) => {
        try {
            let logoUrl = defaultValues?.institution_logo;

            // Only upload if new logo is provided
            if (data.institution_logo) {
                const res = await uploadToCloudinary(data.institution_logo, 'institution-logo');

                if (!isNotEmptyObject(res)) {
                    throw new Error('Failed to upload logo');
                }

                setLogoRes(res);
                logoUrl = res.url;
            }

            const payload = {
                ...data,
                institution_logo: logoUrl,
                achievements: achievements.filter((a) => a.trim()),
            };

            // Remove FileList property
            // delete payload.institution_logo;
            // payload.institution_logo = logoUrl;

            // if (defaultValues) {
            // } else {
            //     onSubmit(payload as InsertEducation);
            // }
            onSubmit(payload);
        } catch (error) {
            console.error('Form submission error:', error);
            if (logoRes?.public_id) {
                await deleteFromCloudinary(logoRes.public_id);
            }
        }
    };

    // Initialize preview from default values
    useEffect(() => {
        if (defaultValues?.institution_logo) {
            setLogoPreview(buildCloudinaryUrl(defaultValues.institution_logo));
        }
    }, [defaultValues]);

    return (
        <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
                {/* Degree */}
                <FormField
                    control={form.control}
                    name="degree"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Degree *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Bachelor of Science in Computer Science"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Institution */}
                <FormField
                    control={form.control}
                    name="institution"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Institution *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., University of Technology"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Location */}
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Boston, MA"
                                    {...field}
                                    value={field.value || ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Dates */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Date *</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Leave empty if current"
                                        type="date"
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Grade */}
                <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Grade/GPA</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., 3.8/4.0"
                                    {...field}
                                    value={field.value || ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    className="min-h-24"
                                    placeholder="Brief description of your studies..."
                                    {...field}
                                    value={field.value || ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Achievements */}
                <div className="space-y-4">
                    <FormLabel>Key Achievements *</FormLabel>
                    <FormDescription>List major accomplishments or honors</FormDescription>

                    {achievements.map((achievement, index) => (
                        <div className="flex gap-2" key={index}>
                            <Input
                                onChange={(e) => handleAchievementChange(index, e.target.value)}
                                placeholder={`Achievement ${index + 1}`}
                                value={achievement}
                            />
                            {achievements.length > 1 && (
                                <Button
                                    onClick={() => handleRemoveAchievement(index)}
                                    size="icon"
                                    type="button"
                                    variant="destructive"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}

                    <Button
                        onClick={handleAddAchievement}
                        size="sm"
                        type="button"
                        variant="outline"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Achievement
                    </Button>

                    <FormField
                        control={form.control}
                        name="achievements"
                        render={() => (
                            <FormItem>
                                <FormControl>
                                    <input type="hidden" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Institution Logo Upload */}
                <FormField
                    control={form.control}
                    name="institution_logo"
                    render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                            <FormLabel>
                                Institution Logo {!defaultValues && '(Optional)'}
                            </FormLabel>
                            <FormControl>
                                <div className="space-y-4">
                                    <Input
                                        accept="image/*"
                                        className="cursor-pointer"
                                        onChange={(e) => {
                                            onChange(e.target.files);
                                            handleLogoChange(e);
                                        }}
                                        type="file"
                                        {...field}
                                    />
                                    {logoPreview && (
                                        <div className="flex items-center gap-4">
                                            <div className="rounded-lg border border-border p-4">
                                                <img
                                                    alt="Logo preview"
                                                    className="h-12 w-12 object-contain"
                                                    src={logoPreview}
                                                />
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                <p>Preview</p>
                                                {defaultValues && (
                                                    <p className="text-xs">
                                                        (Leave empty to keep current logo)
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                            <FormDescription>Upload institution logo (max 2MB)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button disabled={isLoading} loading={isLoading} type="submit">
                    {defaultValues ? 'Update Education' : 'Create Education'}
                </Button>
            </form>
        </Form>
    );
}
