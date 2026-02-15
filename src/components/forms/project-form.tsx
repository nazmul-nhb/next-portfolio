/** biome-ignore-all lint/performance/noImgElement: this is for image preview during upload */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { isArrayOfType, isNotEmptyObject, isString } from 'nhb-toolbox';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { httpRequest } from '@/lib/actions/baseRequest';
import {
    type CloudinaryResponse,
    deleteFromCloudinary,
    uploadMultipleToCloudinary,
    uploadToCloudinary,
} from '@/lib/actions/cloudinary';
import { buildCloudinaryUrl } from '@/lib/utils';
import {
    type ProjectFormData,
    ProjectFormSchema,
    ProjectFormUpdateSchema,
} from '@/lib/zod-schema/projects';
import type { InsertProject, UpdateProject } from '@/types/projects';
import type { SelectSkill } from '@/types/skills';

type ProjectData = Partial<ProjectFormData>;

interface Props {
    onSubmit: ((data: InsertProject) => void) | ((data: UpdateProject) => void);
    defaultValues?: ProjectData;
    isLoading?: boolean;
}

export function ProjectForm({ onSubmit, defaultValues, isLoading = false }: Props) {
    const [techStackItems, setTechStackItems] = useState(defaultValues?.tech_stack || []);
    const [techStackInput, setTechStackInput] = useState('');
    const [skills, setSkills] = useState<SelectSkill[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [features, setFeatures] = useState<string[]>(defaultValues?.features || ['']);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>(Array(3).fill(null));

    const formSchema = defaultValues ? ProjectFormUpdateSchema : ProjectFormSchema;

    const form = useForm<ProjectData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: defaultValues?.title || '',
            live_link: defaultValues?.live_link || '',
            description: defaultValues?.description || '',
            repo_links: defaultValues?.repo_links || ['', ''],
            features: defaultValues?.features || [''],
            tech_stack: defaultValues?.tech_stack || [],
            ...defaultValues,
        },
    });

    // Handle favicon preview
    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFaviconPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle screenshot previews
    const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPreviews = [...screenshotPreviews];
                newPreviews[index] = reader.result as string;
                setScreenshotPreviews(newPreviews);
            };
            reader.readAsDataURL(file);
        }
    };

    // Tech stack handlers
    const handleAddTechStack = (skill?: string) => {
        const techToAdd = skill || techStackInput.trim();
        if (techToAdd && !techStackItems.includes(techToAdd)) {
            const newItems = [...techStackItems, techToAdd];
            setTechStackItems(newItems);
            form.setValue('tech_stack', newItems);
            setTechStackInput('');
            setShowSuggestions(false);
        }
    };

    const filteredSkills = skills.filter(
        (skill) =>
            techStackInput &&
            skill.title.toLowerCase().includes(techStackInput.toLowerCase()) &&
            !techStackItems.includes(skill.title)
    );

    // Fetch skills on mount
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await httpRequest<{ data: SelectSkill[] }>('/api/skills');
                if (response.data && 'data' in response.data) {
                    setSkills(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch skills:', error);
            }
        };
        fetchSkills();
    }, []);

    const handleRemoveTechStack = (index: number) => {
        const newItems = techStackItems.filter((_, i) => i !== index);
        setTechStackItems(newItems);
        form.setValue('tech_stack', newItems);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.currentTarget === document.activeElement) {
            e.preventDefault();
            handleAddTechStack();
        }
    };

    // Features handlers
    const handleAddFeature = () => {
        setFeatures([...features, '']);
    };

    const handleRemoveFeature = (index: number) => {
        if (features.length > 1) {
            const newFeatures = features.filter((_, i) => i !== index);
            setFeatures(newFeatures);
            form.setValue('features', newFeatures);
        }
    };

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
        form.setValue('features', newFeatures);
    };

    const [faviconRes, setFaviconRes] = useState<CloudinaryResponse>();
    const [screenshotsRes, setScreenshotsRes] = useState<CloudinaryResponse[]>();

    // Form submission
    const handleSubmit = async (data: ProjectData) => {
        try {
            const favRes = data?.favicon
                ? await uploadToCloudinary(data.favicon, 'favicon')
                : undefined;

            if (!isNotEmptyObject(favRes)) return;

            setFaviconRes(favRes);

            const ssRes = data?.screenshots
                ? await uploadMultipleToCloudinary(data.screenshots, 'screenshot')
                : undefined;

            if (!isArrayOfType(ssRes, isNotEmptyObject)) return;

            setScreenshotsRes(ssRes);

            const payload = {
                ...data,
                favicon: favRes.url,
                screenshots: ssRes.map((s) => s.url),
            };

            onSubmit(payload as InsertProject);
        } catch {
            if (faviconRes?.public_id) {
                await deleteFromCloudinary(faviconRes.public_id);
            }

            if (isArrayOfType(screenshotsRes, isNotEmptyObject)) {
                await Promise.allSettled(
                    screenshotsRes.map((ss) => deleteFromCloudinary(ss.public_id))
                );
            }
        }
    };

    // Initialize previews from default values
    useEffect(() => {
        if (isString(defaultValues?.favicon)) {
            setFaviconPreview(buildCloudinaryUrl(defaultValues.favicon));
        }

        if (isArrayOfType(defaultValues?.screenshots, isString)) {
            const previews = defaultValues.screenshots.map((ss) => buildCloudinaryUrl(ss));
            setScreenshotPreviews(previews);
        }
    }, [defaultValues?.favicon, defaultValues?.screenshots]);

    return (
        <Form {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(handleSubmit)}>
                {/* Title */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Project Title *</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter project title" {...field} />
                            </FormControl>
                            <FormDescription>Unique title for your project</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Live Link */}
                <FormField
                    control={form.control}
                    name="live_link"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Live URL *</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Repository Links */}
                <div className="space-y-4">
                    <FormLabel>Repository Links</FormLabel>
                    <div className="flex gap-4 flex-col sm:flex-row items-start w-full">
                        <FormField
                            control={form.control}
                            name="repo_links.0"
                            render={({ field }) => (
                                <FormItem className="flex-1 w-full">
                                    <FormLabel>GitHub Link 1 *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://github.com/user/repo1"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="repo_links.1"
                            render={({ field }) => (
                                <FormItem className="flex-1 w-full">
                                    <FormLabel>GitHub Link 2 (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://github.com/user/repo2"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="space-y-4">
                    <FormLabel>Tech Stack *</FormLabel>
                    <div className="space-y-2">
                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    onBlur={() =>
                                        setTimeout(() => setShowSuggestions(false), 200)
                                    }
                                    onChange={(e) => {
                                        setTechStackInput(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Add technology (e.g., React, Node.js)"
                                    value={techStackInput}
                                />
                                {showSuggestions && filteredSkills.length > 0 && (
                                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-lg">
                                        {filteredSkills.map((skill) => (
                                            <button
                                                className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                                key={skill.id}
                                                onClick={() => handleAddTechStack(skill.title)}
                                                type="button"
                                            >
                                                {skill.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button
                                onClick={() => handleAddTechStack()}
                                type="button"
                                variant="outline"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <FormDescription>
                            Press Enter or click + to add technology. Start typing to see
                            suggestions from your skills.
                        </FormDescription>
                        <FormField
                            control={form.control}
                            name="tech_stack"
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

                    {/* Tech Stack Tags */}
                    {techStackItems.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {techStackItems.map((item, idx) => (
                                <div
                                    className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
                                    key={idx}
                                >
                                    <span>{item}</span>
                                    <button
                                        className="ml-1 rounded-full hover:bg-primary/20"
                                        onClick={() => handleRemoveTechStack(idx)}
                                        type="button"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Favicon Upload */}
                <FormField
                    control={form.control}
                    name="favicon"
                    render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                            <FormLabel>Favicon *</FormLabel>
                            <FormControl>
                                <div className="space-y-4">
                                    <Input
                                        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/gif"
                                        className="cursor-pointer"
                                        onChange={(e) => {
                                            onChange(e.target.files);
                                            handleFaviconChange(e);
                                        }}
                                        type="file"
                                        {...field}
                                    />
                                    {faviconPreview && (
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative h-16 w-16 overflow-hidden rounded">
                                                        <img
                                                            alt="Favicon preview"
                                                            className="h-full w-full object-contain"
                                                            src={faviconPreview}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            Preview
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Recommended: 32×32 or 64×64 pixels
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </FormControl>
                            <FormDescription>Upload project favicon (max 2MB)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Screenshots Upload */}
                <div className="space-y-4">
                    <FormLabel>Screenshots *</FormLabel>
                    <FormDescription>Upload exactly 3 screenshots</FormDescription>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {[0, 1, 2].map((index) => (
                            <FormField
                                control={form.control}
                                key={index}
                                name="screenshots"
                                render={({ field: { value, onChange, ...field } }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Screenshot {index + 1} *</FormLabel>
                                        <FormControl>
                                            <div className="space-y-4">
                                                <Input
                                                    accept="image/png,image/jpeg,image/jpg"
                                                    onChange={(e) => {
                                                        const newFiles = new DataTransfer();

                                                        // Copy existing files
                                                        if (value) {
                                                            [...value].forEach((file, i) => {
                                                                if (i !== index) {
                                                                    newFiles.items.add(file);
                                                                }
                                                            });
                                                        }

                                                        // Add new file at position
                                                        const newFile = e.target.files?.[0];
                                                        if (newFile) {
                                                            newFiles.items.add(newFile);
                                                        }

                                                        onChange(newFiles.files);
                                                        handleScreenshotsChange(e, index);
                                                    }}
                                                    type="file"
                                                    {...field}
                                                    className="cursor-pointer"
                                                />
                                                {screenshotPreviews[index] && (
                                                    <Card>
                                                        <CardContent className="p-4">
                                                            <div className="relative aspect-video overflow-hidden rounded">
                                                                <img
                                                                    alt={`Screenshot ${index + 1} preview`}
                                                                    className="h-full w-full object-cover"
                                                                    src={
                                                                        screenshotPreviews[
                                                                            index
                                                                        ]
                                                                    }
                                                                />
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                    <FormLabel>Features *</FormLabel>
                    <FormDescription>Add at least 1 feature</FormDescription>

                    {features.map((feature, index) => (
                        <div className="flex gap-2" key={index}>
                            <Input
                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                placeholder={`Feature ${index + 1}`}
                                value={feature}
                            />
                            {features.length > 1 && (
                                <Button
                                    onClick={() => handleRemoveFeature(index)}
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
                        onClick={handleAddFeature}
                        size="sm"
                        type="button"
                        variant="outline"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Feature
                    </Button>

                    <FormField
                        control={form.control}
                        name="features"
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

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                                <Textarea
                                    className="min-h-32"
                                    placeholder="Describe your project..."
                                    required
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            <FormDescription>
                                Detailed description of the project
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Submit Button */}
                <Button disabled={isLoading} type="submit">
                    {isLoading
                        ? 'Processing...'
                        : defaultValues
                          ? 'Update Project'
                          : 'Create Project'}
                </Button>
            </form>
        </Form>
    );
}
