'use client';

import type { $UUID } from 'locality-idb';
import {
    ArrowDown,
    ArrowUp,
    Download,
    Edit2,
    Image as ImageIcon,
    Loader2,
    Plus,
    Save,
    Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { uuid } from 'nhb-toolbox/hash';
import { Fragment, useCallback, useMemo, useState } from 'react';
import EmptyData from '@/components/misc/empty-data';
import SmartAlert from '@/components/misc/smart-alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    CUSTOM_FIELD_TYPE_OPTIONS,
    DEFAULT_SECTION_LABELS,
    RESUME_FONT_OPTIONS,
} from '@/lib/resume-builder/defaults';
import type {
    CustomSection,
    ListItem,
    ResumeConfig,
    ResumeEducationItem,
    ResumeExperienceItem,
} from '@/lib/resume-builder/types';
import { sortResumeSections } from '@/lib/resume-builder/utils';

interface ResumeControlsProps {
    config: ResumeConfig;
    validationIssues: string[];
    pdfPending: boolean;
    savePending: boolean;
    resumeName: string;
    savedResumes: Array<{ id: $UUID; name: string }>;
    loadingResumes: boolean;
    onHeaderChange: (field: string, value: string | boolean) => void;
    onRemoveImage: () => void;
    onSummaryChange: (value: string) => void;
    onDownloadPdf: () => void;
    onSkillAdd: (name: string) => void;
    onSkillRemove: (id: string) => void;
    onExperienceAdd: (entry: Omit<ResumeExperienceItem, 'id'>) => void;
    onExperienceReorder: (id: string, direction: 'up' | 'down') => void;
    onExperienceUpdate: (id: string, patch: Partial<ResumeExperienceItem>) => void;
    onExperienceRemove: (id: string) => void;
    onEducationAdd: (entry: Omit<ResumeEducationItem, 'id'>) => void;
    onEducationReorder: (id: string, direction: 'up' | 'down') => void;
    onEducationUpdate: (id: string, patch: Partial<ResumeEducationItem>) => void;
    onEducationRemove: (id: string) => void;
    onCustomSectionAdd: (section: CustomSection) => void;
    onCustomSectionUpdate: (id: string, patch: Partial<CustomSection>) => void;
    onCustomSectionRemove: (id: string) => void;
    onSectionToggle: (id: string, enabled: boolean) => void;
    onSectionReorder: (id: string, direction: 'up' | 'down') => void;
    onFontChange: (fontFamily: string) => void;
    onSectionFontChange: (section: string, fontFamily: string) => void;
    onUploadImage: (file: File) => void;
    onSaveName: (name: string) => void;
    onSaveResume: () => void;
    onLoadResume: (resumeId: $UUID) => void;
    onDeleteResume: (resumeId: $UUID) => void;
}

export function ResumeControls({
    config,
    validationIssues,
    pdfPending,
    savePending,
    resumeName,
    savedResumes,
    loadingResumes,
    onHeaderChange,
    onRemoveImage,
    onSummaryChange,
    onDownloadPdf,
    onSkillAdd,
    onSkillRemove,
    onExperienceAdd,
    onExperienceReorder,
    onExperienceUpdate,
    onExperienceRemove,
    onEducationAdd,
    onEducationReorder,
    onEducationUpdate,
    onEducationRemove,
    onCustomSectionAdd,
    onCustomSectionUpdate,
    onCustomSectionRemove,
    onSectionToggle,
    onSectionReorder,
    onFontChange,
    onSectionFontChange,
    onUploadImage,
    onSaveName,
    onSaveResume,
    onLoadResume,
    onDeleteResume,
}: ResumeControlsProps) {
    const [skillInput, setSkillInput] = useState('');
    const [newCustomSection, setNewCustomSection] = useState(false);
    const [customSectionType, setCustomSectionType] = useState<'text' | 'textarea' | 'list'>(
        'text'
    );
    const [customSectionTitle, setCustomSectionTitle] = useState('');

    const sortedSections = useMemo(
        () => sortResumeSections(config.sections),
        [config.sections]
    );

    const handleAddSkill = useCallback(() => {
        if (skillInput.trim()) {
            onSkillAdd(skillInput.trim());
            setSkillInput('');
        }
    }, [skillInput, onSkillAdd]);

    const handleAddExperience = useCallback(() => {
        onExperienceAdd({
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
        });
    }, [onExperienceAdd]);

    const handleAddEducation = useCallback(() => {
        onEducationAdd({
            school: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
        });
    }, [onEducationAdd]);

    const handleAddCustomSection = useCallback(() => {
        if (customSectionTitle.trim()) {
            onCustomSectionAdd({
                id: uuid(),
                title: customSectionTitle.trim(),
                fieldType: customSectionType,
                value: customSectionType === 'list' ? [] : '',
            });
            setCustomSectionTitle('');
            setNewCustomSection(false);
        }
    }, [customSectionTitle, customSectionType, onCustomSectionAdd]);

    const TABS = [
        {
            id: 'summary',
            label: 'Summary',
            content: (
                <div className="space-y-1.5">
                    <Card className="rounded-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Manage Sections
                            </CardTitle>
                            <CardDescription>
                                Enable/disable and reorder resume sections
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {sortedSections.map((section, index) => (
                                <div
                                    className="flex items-center gap-3 rounded-md bg-muted p-3"
                                    key={section.id}
                                >
                                    <Checkbox
                                        checked={section.enabled}
                                        id={`section-${section.id}`}
                                        onCheckedChange={(checked) =>
                                            onSectionToggle(section.id, checked === true)
                                        }
                                    />
                                    <Label
                                        className="flex-1 cursor-pointer"
                                        htmlFor={`section-${section.id}`}
                                    >
                                        {DEFAULT_SECTION_LABELS[section.id]}
                                    </Label>
                                    <div className="flex gap-1">
                                        {index > 0 && (
                                            <Button
                                                onClick={() =>
                                                    onSectionReorder(section.id, 'up')
                                                }
                                                size="sm"
                                                variant="ghost"
                                            >
                                                <ArrowUp className="size-4" />
                                            </Button>
                                        )}
                                        {index < sortedSections.length - 1 && (
                                            <Button
                                                onClick={() =>
                                                    onSectionReorder(section.id, 'down')
                                                }
                                                size="sm"
                                                variant="ghost"
                                            >
                                                <ArrowDown className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card className="rounded-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Edit2 className="size-5" /> Header Information
                            </CardTitle>
                            <CardDescription>
                                Your profile information appears at the top of the resume
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2 [&>div]:space-y-2">
                                <div>
                                    <Label htmlFor="full-name">Full Name</Label>
                                    <Input
                                        id="full-name"
                                        onChange={(e) =>
                                            onHeaderChange('fullName', e.target.value)
                                        }
                                        placeholder="Your Full Name"
                                        value={config.header.fullName}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="job-title">Job Title</Label>
                                    <Input
                                        id="job-title"
                                        onChange={(e) =>
                                            onHeaderChange('jobTitle', e.target.value)
                                        }
                                        placeholder="e.g., Full-Stack Developer"
                                        value={config.header.jobTitle}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        onChange={(e) =>
                                            onHeaderChange('email', e.target.value)
                                        }
                                        placeholder="e.g., your.email@example.com"
                                        type="email"
                                        value={config.header.email || ''}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        onChange={(e) =>
                                            onHeaderChange('phone', e.target.value)
                                        }
                                        placeholder="e.g., +8801623732187"
                                        value={config.header.phone || ''}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        onChange={(e) =>
                                            onHeaderChange('location', e.target.value)
                                        }
                                        placeholder="e.g., Sirajganj, Bangladesh"
                                        value={config.header.location || ''}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        onChange={(e) =>
                                            onHeaderChange('website', e.target.value)
                                        }
                                        placeholder="e.g., https://example.com"
                                        type="url"
                                        value={config.header.website || ''}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="linkedin">LinkedIn</Label>
                                    <Input
                                        id="linkedin"
                                        onChange={(e) =>
                                            onHeaderChange('linkedin', e.target.value)
                                        }
                                        placeholder="e.g., https://linkedin.com/in/username"
                                        value={config.header.linkedin || ''}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="github">GitHub</Label>
                                    <Input
                                        id="github"
                                        onChange={(e) =>
                                            onHeaderChange('github', e.target.value)
                                        }
                                        placeholder="e.g., https://github.com/username"
                                        value={config.header.github || ''}
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-3 border-t pt-4">
                                <Label htmlFor="profile-image">Profile Image</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        accept="image/png, image/jpeg"
                                        id="profile-image"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                onUploadImage(e.target.files[0]);
                                            }
                                        }}
                                        type="file"
                                    />
                                    {config.header.image && (
                                        <div className="shrink-0">
                                            <Image
                                                alt="Profile preview"
                                                className="size-16 rounded-md border border-border object-cover"
                                                height={64}
                                                src={config.header.image.dataUrl}
                                                width={64}
                                            />
                                        </div>
                                    )}
                                </div>
                                {config.header.image && (
                                    <Button onClick={onRemoveImage} size="sm" variant="outline">
                                        Remove Image
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-none">
                        <CardHeader>
                            <CardTitle>Professional Summary</CardTitle>
                            <CardDescription>
                                Brief overview of your professional background
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Textarea
                                className="min-h-32 max-h-40 custom-scroll"
                                onChange={(e) => onSummaryChange(e.target.value)}
                                placeholder="Write a compelling professional summary..."
                                value={config.summary}
                            />
                        </CardContent>
                    </Card>
                </div>
            ),
        },
        {
            id: 'skills',
            label: 'Skills',
            content: (
                <div className="space-y-1.5">
                    <Card className="rounded-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">Skills</CardTitle>
                            <CardDescription>Add your professional skills</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Input
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddSkill();
                                        }
                                    }}
                                    placeholder="Add a skill..."
                                    value={skillInput}
                                />
                                <Button onClick={handleAddSkill} size="icon-sm">
                                    <Plus />
                                </Button>
                            </div>

                            {config.skills.length > 0 ? (
                                <div className="space-y-2">
                                    {config.skills.map((skill) => (
                                        <div
                                            className="flex items-center justify-between rounded-md bg-muted p-3"
                                            key={skill.id}
                                        >
                                            <span>{skill.name}</span>
                                            <Button
                                                onClick={() => onSkillRemove(skill.id)}
                                                size="icon-sm"
                                                variant="destructive"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyData
                                    description="No skills added yet"
                                    Icon={ImageIcon}
                                    title="No Skills"
                                />
                            )}
                        </CardContent>
                    </Card>
                    <Card className="rounded-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Work Experience
                            </CardTitle>
                            <CardDescription>Add your professional experience</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {config.experience.length > 0 && (
                                <div className="space-y-4">
                                    {config.experience.map((exp, index) => (
                                        <div
                                            className="space-y-4 rounded-lg border p-4"
                                            key={exp.id}
                                        >
                                            <div className="grid gap-4 sm:grid-cols-2 [&>div]:space-y-2">
                                                <div>
                                                    <Label htmlFor={`exp-company-${exp.id}`}>
                                                        Company
                                                    </Label>
                                                    <Input
                                                        id={`exp-company-${exp.id}`}
                                                        onChange={(e) =>
                                                            onExperienceUpdate(exp.id, {
                                                                company: e.target.value,
                                                            })
                                                        }
                                                        placeholder="Company Name"
                                                        value={exp.company}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`exp-position-${exp.id}`}>
                                                        Position
                                                    </Label>
                                                    <Input
                                                        id={`exp-position-${exp.id}`}
                                                        onChange={(e) =>
                                                            onExperienceUpdate(exp.id, {
                                                                position: e.target.value,
                                                            })
                                                        }
                                                        placeholder="Your Position"
                                                        value={exp.position}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`exp-start-${exp.id}`}>
                                                        Start Date
                                                    </Label>
                                                    <Input
                                                        id={`exp-start-${exp.id}`}
                                                        onChange={(e) =>
                                                            onExperienceUpdate(exp.id, {
                                                                startDate: e.target.value,
                                                            })
                                                        }
                                                        type="month"
                                                        value={exp.startDate}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`exp-end-${exp.id}`}>
                                                        End Date
                                                    </Label>
                                                    <Input
                                                        disabled={exp.current}
                                                        id={`exp-end-${exp.id}`}
                                                        onChange={(e) =>
                                                            onExperienceUpdate(exp.id, {
                                                                endDate: e.target.value,
                                                            })
                                                        }
                                                        type="month"
                                                        value={exp.endDate}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={exp.current}
                                                    id={`exp-current-${exp.id}`}
                                                    onCheckedChange={(checked) =>
                                                        onExperienceUpdate(exp.id, {
                                                            current: checked === true,
                                                        })
                                                    }
                                                />
                                                <Label htmlFor={`exp-current-${exp.id}`}>
                                                    Currently working here
                                                </Label>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`exp-desc-${exp.id}`}>
                                                    Description
                                                </Label>
                                                <Textarea
                                                    className="min-h-20 max-h-40 custom-scroll"
                                                    id={`exp-desc-${exp.id}`}
                                                    onChange={(e) =>
                                                        onExperienceUpdate(exp.id, {
                                                            description: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Describe your role and achievements..."
                                                    value={exp.description}
                                                />
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                {index > 0 && (
                                                    <Button
                                                        onClick={() =>
                                                            onExperienceReorder(exp.id, 'up')
                                                        }
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <ArrowUp className="size-4" />
                                                    </Button>
                                                )}
                                                {index < config.experience.length - 1 && (
                                                    <Button
                                                        onClick={() =>
                                                            onExperienceReorder(exp.id, 'down')
                                                        }
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <ArrowDown className="size-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() => onExperienceRemove(exp.id)}
                                                    size="icon-sm"
                                                    variant="destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Button
                                className="w-full"
                                onClick={handleAddExperience}
                                variant="outline"
                            >
                                <Plus className="mr-2 size-4" />
                                Add Experience
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="rounded-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">Education</CardTitle>
                            <CardDescription>Add your educational background</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {config.education.length > 0 && (
                                <div className="space-y-4">
                                    {config.education.map((edu, index) => (
                                        <div
                                            className="space-y-4 rounded-lg border p-4"
                                            key={edu.id}
                                        >
                                            <div className="grid gap-4 sm:grid-cols-2 [&>div]:space-y-2">
                                                <div>
                                                    <Label htmlFor={`edu-school-${edu.id}`}>
                                                        School
                                                    </Label>
                                                    <Input
                                                        id={`edu-school-${edu.id}`}
                                                        onChange={(e) =>
                                                            onEducationUpdate(edu.id, {
                                                                school: e.target.value,
                                                            })
                                                        }
                                                        placeholder="University Name"
                                                        value={edu.school}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`edu-degree-${edu.id}`}>
                                                        Degree
                                                    </Label>
                                                    <Input
                                                        id={`edu-degree-${edu.id}`}
                                                        onChange={(e) =>
                                                            onEducationUpdate(edu.id, {
                                                                degree: e.target.value,
                                                            })
                                                        }
                                                        placeholder="e.g., Bachelor of Science"
                                                        value={edu.degree}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`edu-field-${edu.id}`}>
                                                        Field of Study
                                                    </Label>
                                                    <Input
                                                        id={`edu-field-${edu.id}`}
                                                        onChange={(e) =>
                                                            onEducationUpdate(edu.id, {
                                                                field: e.target.value,
                                                            })
                                                        }
                                                        placeholder="e.g., Computer Science"
                                                        value={edu.field}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`edu-start-${edu.id}`}>
                                                        Start Date
                                                    </Label>
                                                    <Input
                                                        id={`edu-start-${edu.id}`}
                                                        onChange={(e) =>
                                                            onEducationUpdate(edu.id, {
                                                                startDate: e.target.value,
                                                            })
                                                        }
                                                        type="month"
                                                        value={edu.startDate}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`edu-end-${edu.id}`}>
                                                        End Date
                                                    </Label>
                                                    <Input
                                                        disabled={edu.current}
                                                        id={`edu-end-${edu.id}`}
                                                        onChange={(e) =>
                                                            onEducationUpdate(edu.id, {
                                                                endDate: e.target.value,
                                                            })
                                                        }
                                                        type="month"
                                                        value={edu.endDate}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={edu.current}
                                                    id={`edu-current-${edu.id}`}
                                                    onCheckedChange={(checked) =>
                                                        onEducationUpdate(edu.id, {
                                                            current: checked === true,
                                                        })
                                                    }
                                                />
                                                <Label htmlFor={`edu-current-${edu.id}`}>
                                                    Currently studying
                                                </Label>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`edu-desc-${edu.id}`}>
                                                    Description (Optional)
                                                </Label>
                                                <Textarea
                                                    className="min-h-20 max-h-40 custom-scroll"
                                                    id={`edu-desc-${edu.id}`}
                                                    onChange={(e) =>
                                                        onEducationUpdate(edu.id, {
                                                            description: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Any additional details..."
                                                    value={edu.description || ''}
                                                />
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                {index > 0 && (
                                                    <Button
                                                        onClick={() =>
                                                            onEducationReorder(edu.id, 'up')
                                                        }
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <ArrowUp className="size-4" />
                                                    </Button>
                                                )}
                                                {index < config.education.length - 1 && (
                                                    <Button
                                                        onClick={() =>
                                                            onEducationReorder(edu.id, 'down')
                                                        }
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <ArrowDown className="size-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() => onEducationRemove(edu.id)}
                                                    size="icon-sm"
                                                    variant="destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Button
                                className="w-full"
                                onClick={handleAddEducation}
                                variant="outline"
                            >
                                <Plus className="mr-2 size-4" />
                                Add Education
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            ),
        },
        {
            id: 'customize',
            label: 'Customize',
            content: (
                <div className="space-y-1.5">
                    <Card className="rounded-none">
                        <CardHeader>
                            <CardTitle>Font Settings</CardTitle>
                            <CardDescription>Customize fonts for your resume</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="global-font">Global Font</Label>
                                <Select onValueChange={onFontChange} value={config.fontFamily}>
                                    <SelectTrigger id="global-font">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {RESUME_FONT_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.fontFamily}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="border-t pt-4 space-y-3">
                                <p className="font-medium text-sm">Section-Specific Fonts</p>
                                {Object.entries(DEFAULT_SECTION_LABELS).map(
                                    ([sectionId, label]) => (
                                        <div className="space-y-2" key={sectionId}>
                                            <Label htmlFor={`section-font-${sectionId}`}>
                                                {label}
                                            </Label>
                                            <Select
                                                onValueChange={(value) =>
                                                    onSectionFontChange(sectionId, value)
                                                }
                                                value={
                                                    config.sectionFonts[
                                                        sectionId as keyof typeof DEFAULT_SECTION_LABELS
                                                    ] || config.fontFamily
                                                }
                                            >
                                                <SelectTrigger id={`section-font-${sectionId}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {RESUME_FONT_OPTIONS.map((option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.fontFamily}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Custom Sections
                            </CardTitle>
                            <CardDescription>
                                Add custom sections to your resume
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {config.customSections.length > 0 && (
                                <div className="space-y-4">
                                    {config.customSections.map((section) => (
                                        <div
                                            className="space-y-4 rounded-lg border p-4"
                                            key={section.id}
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold">
                                                    {section.title}
                                                </h3>
                                                <Button
                                                    onClick={() =>
                                                        onCustomSectionRemove(section.id)
                                                    }
                                                    size="icon-sm"
                                                    variant="destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>

                                            {section.fieldType === 'textarea' &&
                                                typeof section.value === 'string' && (
                                                    <Textarea
                                                        className="min-h-24 max-h-40 custom-scroll"
                                                        onChange={(e) =>
                                                            onCustomSectionUpdate(section.id, {
                                                                value: e.target.value,
                                                            })
                                                        }
                                                        placeholder="Enter your content..."
                                                        value={section.value}
                                                    />
                                                )}

                                            {section.fieldType === 'text' &&
                                                typeof section.value === 'string' && (
                                                    <Input
                                                        onChange={(e) =>
                                                            onCustomSectionUpdate(section.id, {
                                                                value: e.target.value,
                                                            })
                                                        }
                                                        placeholder="Enter your content..."
                                                        value={section.value}
                                                    />
                                                )}

                                            {section.fieldType === 'list' &&
                                                Array.isArray(section.value) && (
                                                    <div className="space-y-2">
                                                        {(
                                                            section.value as Array<{
                                                                id: string;
                                                                value: string;
                                                            }>
                                                        ).map((item, idx) => (
                                                            <div
                                                                className="flex gap-2 items-center"
                                                                key={item.id}
                                                            >
                                                                <Input
                                                                    onChange={(e) => {
                                                                        const updated = [
                                                                            ...section.value,
                                                                        ] as Array<{
                                                                            id: string;
                                                                            value: string;
                                                                        }>;
                                                                        updated[idx] = {
                                                                            ...item,
                                                                            value: e.target
                                                                                .value,
                                                                        };
                                                                        onCustomSectionUpdate(
                                                                            section.id,
                                                                            { value: updated }
                                                                        );
                                                                    }}
                                                                    placeholder="List item..."
                                                                    value={item.value}
                                                                />
                                                                <Button
                                                                    onClick={() => {
                                                                        if (
                                                                            Array.isArray(
                                                                                section.value
                                                                            )
                                                                        ) {
                                                                            const updated =
                                                                                section.value.filter(
                                                                                    (i) =>
                                                                                        i.id !==
                                                                                        item.id
                                                                                );
                                                                            onCustomSectionUpdate(
                                                                                section.id,
                                                                                {
                                                                                    value: updated,
                                                                                }
                                                                            );
                                                                        }
                                                                    }}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            onClick={() => {
                                                                const updated = [
                                                                    ...section.value,
                                                                    { id: uuid(), value: '' },
                                                                ] as ListItem[];
                                                                onCustomSectionUpdate(
                                                                    section.id,
                                                                    {
                                                                        value: updated,
                                                                    }
                                                                );
                                                            }}
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            <Plus className="mr-2 size-4" />
                                                            Add Item
                                                        </Button>
                                                    </div>
                                                )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!newCustomSection ? (
                                <Button
                                    className="w-full"
                                    onClick={() => setNewCustomSection(true)}
                                    variant="outline"
                                >
                                    <Plus className="mr-2 size-4" />
                                    Add Custom Section
                                </Button>
                            ) : (
                                <div className="space-y-4 rounded-lg border p-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="custom-title">Section Title</Label>
                                        <Input
                                            id="custom-title"
                                            onChange={(e) =>
                                                setCustomSectionTitle(e.target.value)
                                            }
                                            placeholder="e.g., Certifications, Languages"
                                            value={customSectionTitle}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="custom-type">Field Type</Label>
                                        <Select
                                            onValueChange={(
                                                value: 'text' | 'textarea' | 'list'
                                            ) => setCustomSectionType(value)}
                                            value={customSectionType}
                                        >
                                            <SelectTrigger id="custom-type">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CUSTOM_FIELD_TYPE_OPTIONS.map((option) => (
                                                    <SelectItem
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            className="flex-1"
                                            onClick={handleAddCustomSection}
                                        >
                                            Create Section
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            onClick={() => setNewCustomSection(false)}
                                            variant="outline"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ),
        },
        {
            id: 'export',
            label: 'Export',
            content: (
                <div className="space-y-4">
                    <Card className="rounded-none">
                        <CardHeader>
                            <CardTitle>Download PDF</CardTitle>
                            <CardDescription>
                                Export a clean white-page PDF version of this resume
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                The downloaded file uses a white A4 layout for a professional
                                finish.
                            </p>
                            <Button
                                className="w-full"
                                disabled={pdfPending}
                                onClick={onDownloadPdf}
                            >
                                {pdfPending ? (
                                    <Fragment>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Generating PDF...
                                    </Fragment>
                                ) : (
                                    <Fragment>
                                        <Download className="mr-2 size-4" />
                                        Download PDF
                                    </Fragment>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-none">
                        <CardHeader>
                            <CardTitle>Save Resume</CardTitle>
                            <CardDescription>
                                Save your current resume to IndexedDB
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="resume-name">Resume Name</Label>
                                <Input
                                    id="resume-name"
                                    onChange={(e) => onSaveName(e.target.value)}
                                    placeholder="e.g., Full-Stack Developer 2025"
                                    value={resumeName}
                                />
                            </div>
                            <Button
                                className="w-full"
                                disabled={savePending}
                                onClick={onSaveResume}
                            >
                                {savePending ? (
                                    <Fragment>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Saving...
                                    </Fragment>
                                ) : (
                                    <Fragment>
                                        <Save className="mr-2 size-4" />
                                        Save Resume
                                    </Fragment>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-none">
                        <CardHeader>
                            <CardTitle>Saved Resumes</CardTitle>
                            <CardDescription>Load or delete saved resumes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingResumes ? (
                                <div className="flex items-center justify-center p-6">
                                    <Loader2 className="size-5 animate-spin" />
                                </div>
                            ) : savedResumes.length > 0 ? (
                                <div className="space-y-2">
                                    {savedResumes.map((resume) => (
                                        <div
                                            className="flex items-center justify-between rounded-md bg-muted p-3"
                                            key={resume.id}
                                        >
                                            <span className="font-medium">{resume.name}</span>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => onLoadResume(resume.id)}
                                                    size="sm"
                                                >
                                                    <Download className="mr-1 size-4" />
                                                    Load
                                                </Button>
                                                <Button
                                                    onClick={() => onDeleteResume(resume.id)}
                                                    size="icon-sm"
                                                    variant="destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyData
                                    description="No saved resumes yet"
                                    Icon={ImageIcon}
                                    title="No Saved Resumes"
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            ),
        },
    ];

    return (
        <div className="mx-auto max-h-fit max-w-full space-y-6 overflow-y-auto border bg-card custom-scroll">
            {validationIssues.length > 0 && (
                <SmartAlert
                    description={
                        <ul className="ml-5 list-disc space-y-1">
                            {validationIssues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                            ))}
                        </ul>
                    }
                    title="Review these values before saving"
                    variant="destructive"
                />
            )}

            <Tabs className="w-full gap-4" defaultValue="summary">
                <TabsList
                    className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b px-0 pb-1"
                    variant="line"
                >
                    {TABS.map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {TABS.map((tab) => (
                    <TabsContent className="space-y-0" key={tab.id} value={tab.id}>
                        {tab.content}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
