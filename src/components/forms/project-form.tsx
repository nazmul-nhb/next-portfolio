'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { isNotEmptyObject } from 'nhb-toolbox';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
    uploadToCloudinary,
} from '@/lib/actions/cloudinary';
import { buildCloudinaryUrl } from '@/lib/utils';
import {
    type ProjectFormData,
    ProjectFormSchema,
    ProjectFormUpdateSchema,
} from '@/lib/zod-schema/projects';
import type { InsertProject, SelectProject, UpdateProject } from '@/types/projects';
import type { SelectSkill } from '@/types/skills';

type ProjectData = Partial<ProjectFormData>;

interface Props {
    onSubmit: ((data: InsertProject) => void) | ((data: UpdateProject) => void);
    defaultValues?: SelectProject;
    isLoading?: boolean;
}

export function ProjectForm({ onSubmit, defaultValues, isLoading = false }: Props) {
    const isUpdateMode = !!defaultValues;

    // State management
    const [techStackItems, setTechStackItems] = useState(defaultValues?.tech_stack || []);
    const [techStackInput, setTechStackInput] = useState('');
    const [skills, setSkills] = useState<SelectSkill[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [features, setFeatures] = useState<string[]>(defaultValues?.features || ['']);
    const [isUploading, setIsUploading] = useState(false);

    // Image state - track individual files for better control
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [screenshotFiles, setScreenshotFiles] = useState<(File | null)[]>([null, null, null]);
    const [screenshotPreviews, setScreenshotPreviews] = useState<(string | null)[]>([
        null,
        null,
        null,
    ]);

    const formSchema = isUpdateMode ? ProjectFormUpdateSchema : ProjectFormSchema;

    const form = useForm<ProjectData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: defaultValues?.title || '',
            live_link: defaultValues?.live_link || '',
            description: defaultValues?.description || '',
            repo_links: defaultValues?.repo_links || ['', ''],
            features: defaultValues?.features || [''],
            tech_stack: defaultValues?.tech_stack || [],
        } as ProjectData,
    });

    // Helper: Create preview from file
    const createPreview = (file: File, callback: (url: string) => void) => {
        const reader = new FileReader();
        reader.onloadend = () => callback(reader.result as string);
        reader.readAsDataURL(file);
    };

    // Helper: Convert File array to FileList for form validation
    const filesToFileList = (files: (File | null)[]): FileList | undefined => {
        const validFiles = files.filter((f): f is File => f !== null);
        if (validFiles.length === 0) return undefined;

        const dataTransfer = new DataTransfer();
        for (const file of validFiles) {
            dataTransfer.items.add(file);
        }
        return dataTransfer.files;
    };

    // Image handlers
    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFaviconFile(file);
            createPreview(file, setFaviconPreview);

            // Update form with FileList (required for create mode, optional for update)
            const dt = new DataTransfer();
            dt.items.add(file);
            form.setValue('favicon', dt.files);
        }
    };

    const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const newFiles = [...screenshotFiles];
            newFiles[index] = file;
            setScreenshotFiles(newFiles);

            const newPreviews = [...screenshotPreviews];
            createPreview(file, (url) => {
                newPreviews[index] = url;
                setScreenshotPreviews(newPreviews);
            });

            // For create mode, only update form if we have all 3 screenshots
            // For update mode, we handle validation in submit handler
            if (!isUpdateMode) {
                const fileList = filesToFileList(newFiles);
                if (fileList && fileList.length === 3) {
                    form.setValue('screenshots', fileList);
                }
            }
        }
    };

    // Tech stack handlers
    const addTechStack = (skill?: string) => {
        const techToAdd = skill || techStackInput.trim();
        if (techToAdd && !techStackItems.includes(techToAdd)) {
            const newItems = [...techStackItems, techToAdd];
            setTechStackItems(newItems);
            form.setValue('tech_stack', newItems);
            setTechStackInput('');
            setShowSuggestions(false);
        }
    };

    const removeTechStack = (index: number) => {
        const newItems = techStackItems.filter((_, i) => i !== index);
        setTechStackItems(newItems);
        form.setValue('tech_stack', newItems);
    };

    const handleTechStackKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.currentTarget === document.activeElement) {
            e.preventDefault();
            addTechStack();
        }
    };

    const filteredSkills = skills.filter(
        (skill) =>
            techStackInput &&
            skill.title.toLowerCase().includes(techStackInput.toLowerCase()) &&
            !techStackItems.includes(skill.title)
    );

    // Features handlers
    const addFeature = () => setFeatures([...features, '']);

    const removeFeature = (index: number) => {
        if (features.length > 1) {
            const newFeatures = features.filter((_, i) => i !== index);
            setFeatures(newFeatures);
            form.setValue('features', newFeatures);
        }
    };

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
        form.setValue('features', newFeatures);
    };

    // Form submission with optimized image handling
    const handleSubmit = async (data: ProjectData) => {
        const uploadedAssets: Array<CloudinaryResponse> = [];

        try {
            setIsUploading(true);

            // Handle favicon
            let faviconUrl: string;
            if (faviconFile) {
                const favRes = await uploadToCloudinary(faviconFile, 'favicon');
                if (!isNotEmptyObject(favRes)) {
                    toast.error('Failed to upload favicon');
                    return;
                }
                uploadedAssets.push(favRes);
                faviconUrl = favRes.url;
            } else if (defaultValues?.favicon) {
                faviconUrl = defaultValues.favicon;
            } else {
                toast.error('Favicon is required');
                return;
            }

            // Handle screenshots - upload only changed ones
            const screenshotUrls: string[] = [];
            for (let i = 0; i < 3; i++) {
                if (screenshotFiles[i]) {
                    // New file - upload it
                    const screenshotFile = screenshotFiles[i];
                    if (!screenshotFile) continue;

                    const ssFileList = new DataTransfer();
                    ssFileList.items.add(screenshotFile);
                    const ssRes = await uploadToCloudinary(ssFileList.files, 'screenshot');
                    if (!isNotEmptyObject(ssRes)) {
                        toast.error(`Failed to upload screenshot ${i + 1}`);
                        // Cleanup previously uploaded assets
                        await Promise.allSettled(
                            uploadedAssets.map((asset) => deleteFromCloudinary(asset.public_id))
                        );
                        return;
                    }
                    uploadedAssets.push(ssRes);
                    screenshotUrls[i] = ssRes.url;
                } else if (defaultValues?.screenshots?.[i]) {
                    // Keep existing
                    screenshotUrls[i] = defaultValues.screenshots[i];
                } else {
                    toast.error(`Screenshot ${i + 1} is required`);
                    // Cleanup uploaded assets
                    await Promise.allSettled(
                        uploadedAssets.map((asset) => deleteFromCloudinary(asset.public_id))
                    );
                    return;
                }
            }

            const payload = {
                ...data,
                favicon: faviconUrl,
                screenshots: screenshotUrls,
            };

            onSubmit(payload as InsertProject);
        } catch (error) {
            console.error('Error submitting project:', error);
            toast.error('Failed to submit project. Please try again.');

            // Cleanup any uploaded assets
            if (uploadedAssets.length > 0) {
                await Promise.allSettled(
                    uploadedAssets.map((asset) => deleteFromCloudinary(asset.public_id))
                );
            }
        } finally {
            setIsUploading(false);
        }
    };

    // Initialize from default values
    useEffect(() => {
        if (defaultValues) {
            setFaviconPreview(buildCloudinaryUrl(defaultValues.favicon));
            setScreenshotPreviews(
                defaultValues.screenshots.map((ss) => buildCloudinaryUrl(ss))
            );
        }
    }, [defaultValues]);

    // Fetch skills on mount
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const { data } = await httpRequest<SelectSkill[]>('/api/skills');
                if (data) setSkills(data);
            } catch (error) {
                console.error('Failed to fetch skills:', error);
            }
        };
        fetchSkills();
    }, []);

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
                                    <FormLabel>Repository Link 1 *</FormLabel>
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
                                    <FormLabel>Repository Link 2 (Optional)</FormLabel>
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

                <div className="flex items-start w-full flex-col gap-4 sm:flex-row">
                    {/* Tech Stack */}
                    <div className="space-y-2 flex-1 w-full">
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
                                        onKeyDown={handleTechStackKeyDown}
                                        placeholder="Add technology (e.g., React, Node.js)"
                                        value={techStackInput}
                                    />
                                    {showSuggestions && filteredSkills.length > 0 && (
                                        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-lg">
                                            {filteredSkills.map((skill) => (
                                                <button
                                                    className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                                    key={skill.id}
                                                    onClick={() => addTechStack(skill.title)}
                                                    type="button"
                                                >
                                                    {skill.title}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    onClick={() => addTechStack()}
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
                                            onClick={() => removeTechStack(idx)}
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
                            <FormItem className="flex-1 w-full">
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
                                                            {/** biome-ignore lint/performance/noImgElement: for image preview */}
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
                                                                Recommended: 32×32 or 64×64
                                                                pixels
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    Upload project favicon (max 2MB)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

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
                                                    className="cursor-pointer"
                                                    onChange={(e) => {
                                                        handleScreenshotChange(e, index);
                                                    }}
                                                    type="file"
                                                    {...field}
                                                    value=""
                                                />
                                                {screenshotPreviews[index] && (
                                                    <Card>
                                                        <CardContent className="p-4">
                                                            <div className="relative aspect-video overflow-hidden rounded">
                                                                {/** biome-ignore lint/performance/noImgElement: for preview */}
                                                                <img
                                                                    alt={`Screenshot ${index + 1} preview`}
                                                                    className="h-full w-full object-cover"
                                                                    src={
                                                                        screenshotPreviews[
                                                                            index
                                                                        ] ?? ''
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
                                onChange={(e) => updateFeature(index, e.target.value)}
                                placeholder={`Feature ${index + 1}`}
                                value={feature}
                            />
                            {features.length > 1 && (
                                <Button
                                    onClick={() => removeFeature(index)}
                                    size="icon"
                                    type="button"
                                    variant="destructive"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}

                    <Button onClick={addFeature} size="sm" type="button" variant="outline">
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
                <Button
                    disabled={isLoading || isUploading}
                    loading={isLoading || isUploading}
                    type="submit"
                >
                    {defaultValues ? 'Update Project' : 'Create Project'}
                </Button>
            </form>
        </Form>
    );
}
