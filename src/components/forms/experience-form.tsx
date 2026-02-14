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
import { ExperienceFormSchema, ExperienceFormUpdateSchema } from '@/lib/zod-schema/career';
import type { InsertExperience, SelectExperience, UpdateExperience } from '@/types/career';

type ExperienceFormData = z.infer<typeof ExperienceFormSchema>;
type ExperienceFormUpdateData = z.infer<typeof ExperienceFormUpdateSchema>;

interface ExperienceFormProps {
    onSubmit: (data: InsertExperience | UpdateExperience) => void;
    defaultValues?: SelectExperience;
    isLoading?: boolean;
}

export function ExperienceForm({
    onSubmit,
    defaultValues,
    isLoading = false,
}: ExperienceFormProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoRes, setLogoRes] = useState<CloudinaryResponse>();
    const [technologies, setTechnologies] = useState<string[]>(
        defaultValues?.technologies || []
    );
    const [techInput, setTechInput] = useState('');
    const [achievements, setAchievements] = useState<string[]>(
        defaultValues?.achievements || ['']
    );

    const formSchema = defaultValues ? ExperienceFormUpdateSchema : ExperienceFormSchema;

    const form = useForm<ExperienceFormData | ExperienceFormUpdateData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            position: defaultValues?.position || '',
            company: defaultValues?.company || '',
            location: defaultValues?.location || '',
            start_date: defaultValues?.start_date || '',
            end_date: defaultValues?.end_date || '',
            description: defaultValues?.description || '',
            technologies: defaultValues?.technologies || [],
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

    // Technologies handlers
    const handleAddTechnology = () => {
        if (techInput.trim() && !technologies.includes(techInput.trim())) {
            const newTechs = [...technologies, techInput.trim()];
            setTechnologies(newTechs);
            form.setValue('technologies', newTechs);
            setTechInput('');
        }
    };

    const handleRemoveTechnology = (index: number) => {
        const newTechs = technologies.filter((_, i) => i !== index);
        setTechnologies(newTechs);
        form.setValue('technologies', newTechs);
    };

    const handleTechKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.currentTarget === document.activeElement) {
            e.preventDefault();
            handleAddTechnology();
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
    const handleSubmit = async (data: ExperienceFormData | ExperienceFormUpdateData) => {
        try {
            let logoUrl = defaultValues?.company_logo;

            // Only upload if new logo is provided
            if (data.company_logo) {
                const res = await uploadToCloudinary(data.company_logo, 'company-logo');

                if (!isNotEmptyObject(res)) {
                    throw new Error('Failed to upload logo');
                }

                setLogoRes(res);
                logoUrl = res.url;
            }

            const payload = {
                ...data,
                company_logo: logoUrl,
                technologies,
                achievements: achievements.filter((a) => a.trim()),
            };

            // // Remove FileList property
            // delete (payload as { company_logo?: FileList | string }).company_logo;
            // (payload as InsertExperience).company_logo = logoUrl as string;

            // if (defaultValues) {
            //     onSubmit(payload as UpdateExperience);
            // } else {
            onSubmit(payload);
            // }
        } catch (error) {
            console.error('Form submission error:', error);
            if (logoRes?.public_id) {
                await deleteFromCloudinary(logoRes.public_id);
            }
            throw error;
        }
    };

    // Initialize preview from default values
    useEffect(() => {
        if (defaultValues?.company_logo) {
            setLogoPreview(defaultValues.company_logo);
        }
    }, [defaultValues]);

    return (
        <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
                {/* Position */}
                <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Position *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Senior Full Stack Developer"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Company */}
                <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company *</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Tech Company Inc." {...field} />
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
                                    placeholder="e.g., San Francisco, CA"
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
                                    placeholder="Brief description of your role..."
                                    {...field}
                                    value={field.value || ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Technologies */}
                <div className="space-y-4">
                    <FormLabel>Technologies *</FormLabel>
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <Input
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyDown={handleTechKeyDown}
                                placeholder="Add technology"
                                value={techInput}
                            />
                            <Button
                                onClick={handleAddTechnology}
                                type="button"
                                variant="outline"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <FormDescription>Add technologies used in this role</FormDescription>
                        <FormField
                            control={form.control}
                            name="technologies"
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

                    {technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {technologies.map((tech, idx) => (
                                <div
                                    className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
                                    key={idx}
                                >
                                    <span>{tech}</span>
                                    <button
                                        className="ml-1 rounded-full hover:bg-primary/20"
                                        onClick={() => handleRemoveTechnology(idx)}
                                        type="button"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Achievements */}
                <div className="space-y-4">
                    <FormLabel>Key Achievements *</FormLabel>
                    <FormDescription>List major accomplishments in this role</FormDescription>

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

                {/* Company Logo Upload */}
                <FormField
                    control={form.control}
                    name="company_logo"
                    render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                            <FormLabel>Company Logo {!defaultValues && '(Optional)'}</FormLabel>
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
                            <FormDescription>Upload company logo (max 2MB)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button disabled={isLoading} type="submit">
                    {isLoading
                        ? 'Saving...'
                        : defaultValues
                          ? 'Update Experience'
                          : 'Create Experience'}
                </Button>
            </form>
        </Form>
    );
}
