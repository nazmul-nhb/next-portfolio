'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { $UUID } from 'locality-idb';
import { uuid } from 'nhb-toolbox/hash';
import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    deleteSavedResume,
    getSavedResume,
    listSavedResumes,
    saveResume,
    updateResume,
} from '@/lib/indexed-db';
import { DEFAULT_RESUME_CONFIG } from '@/lib/resume-builder/defaults';
import { ResumeConfigSchema } from '@/lib/resume-builder/schema';
import type { ResumeConfig, ResumeImageLayer } from '@/lib/resume-builder/types';
import { normalizeResumeConfig } from '@/lib/resume-builder/utils';
import { ResumeControls } from './ResumeControls';
import ResumePrevier from './ResumePreviewer';

/**
 * Main Resume Builder component
 */
export default function ResumeBuilder() {
    const isBrowser = typeof window !== 'undefined';
    const queryClient = useQueryClient();
    const [config, setConfig] = useState<ResumeConfig>(() =>
        normalizeResumeConfig(DEFAULT_RESUME_CONFIG)
    );
    const [resumeName, setResumeName] = useState('My Resume');
    const currentResumeIdRef = useRef<string | null>(null);

    const validation = useMemo(() => ResumeConfigSchema.safeParse(config), [config]);

    const savedResumesQuery = useQuery({
        enabled: isBrowser,
        queryKey: ['resume-builder', 'saved'],
        queryFn: listSavedResumes,
    });

    const savedResumes = useMemo(
        () =>
            (savedResumesQuery.data ?? []).map((resume) => ({
                id: resume.id,
                name: resume.name,
            })),
        [savedResumesQuery.data]
    );

    const saveMutation = useMutation({
        mutationFn: async (isNew: boolean) => {
            if (!validation.success) {
                throw new Error('Resume configuration is invalid. Please fix the errors.');
            }

            const validConfig = validation.data as ResumeConfig;

            if (isNew) {
                return saveResume({
                    name: resumeName,
                    config: validConfig,
                });
            } else if (currentResumeIdRef.current) {
                const id = currentResumeIdRef.current as unknown as Parameters<
                    typeof updateResume
                >[0];
                await updateResume(id, {
                    name: resumeName,
                    config: validConfig,
                });
                return { success: true };
            }

            throw new Error('No resume ID to update');
        },
        onSuccess: (result) => {
            if (result && typeof result === 'object' && 'id' in result) {
                currentResumeIdRef.current = result.id;
            }
            toast.success(`Resume "${resumeName}" saved successfully!`);
            void queryClient.invalidateQueries({ queryKey: ['resume-builder', 'saved'] });
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to save resume');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSavedResume,
        onSuccess: () => {
            toast.success('Resume deleted successfully.');
            void queryClient.invalidateQueries({ queryKey: ['resume-builder', 'saved'] });
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to delete resume');
        },
    });

    const loadMutation = useMutation({
        mutationFn: (resumeId: string) => {
            const id = resumeId as unknown as Parameters<typeof getSavedResume>[0];
            return getSavedResume(id);
        },
        onSuccess: (resume) => {
            if (resume) {
                currentResumeIdRef.current = resume.id;
                setConfig(normalizeResumeConfig(resume.config));
                setResumeName(resume.name);
                toast.success(`Loaded resume "${resume.name}"`);
            }
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to load resume');
        },
    });

    const validationIssues = validation.success
        ? []
        : validation.error.issues.map((issue) => issue.message);

    // Header updates
    const updateHeader = useCallback((field: string, value: string | boolean | undefined) => {
        setConfig((prev) => ({
            ...prev,
            header: {
                ...prev.header,
                [field]: value,
            } as ResumeConfig['header'],
        }));
    }, []);

    // Image updates
    const updateImage = useCallback((imageData: ResumeImageLayer | null) => {
        setConfig((prev) => ({
            ...prev,
            header: {
                ...prev.header,
                image: imageData ?? undefined,
            },
        }));
    }, []);

    // Summary updates
    const updateSummary = useCallback((value: string) => {
        setConfig((prev) => ({ ...prev, summary: value }));
    }, []);

    // Skills updates
    const addSkill = useCallback((name: string) => {
        setConfig((prev) => ({
            ...prev,
            skills: [...prev.skills, { id: uuid(), name }],
        }));
    }, []);

    const removeSkill = useCallback((id: string) => {
        setConfig((prev) => ({
            ...prev,
            skills: prev.skills.filter((skill) => skill.id !== id),
        }));
    }, []);

    // Experience updates
    const addExperience = useCallback((entry: Omit<ResumeConfig['experience'][0], 'id'>) => {
        setConfig((prev) => ({
            ...prev,
            experience: [...prev.experience, { ...entry, id: uuid() }],
        }));
    }, []);

    const updateExperience = useCallback(
        (id: string, patch: Partial<ResumeConfig['experience'][0]>) => {
            setConfig((prev) => ({
                ...prev,
                experience: prev.experience.map((exp) =>
                    exp.id === id ? { ...exp, ...patch } : exp
                ),
            }));
        },
        []
    );

    const removeExperience = useCallback((id: string) => {
        setConfig((prev) => ({
            ...prev,
            experience: prev.experience.filter((exp) => exp.id !== id),
        }));
    }, []);

    // Education updates
    const addEducation = useCallback((entry: Omit<ResumeConfig['education'][0], 'id'>) => {
        setConfig((prev) => ({
            ...prev,
            education: [...prev.education, { ...entry, id: uuid() }],
        }));
    }, []);

    const updateEducation = useCallback(
        (id: string, patch: Partial<ResumeConfig['education'][0]>) => {
            setConfig((prev) => ({
                ...prev,
                education: prev.education.map((edu) =>
                    edu.id === id ? { ...edu, ...patch } : edu
                ),
            }));
        },
        []
    );

    const removeEducation = useCallback((id: string) => {
        setConfig((prev) => ({
            ...prev,
            education: prev.education.filter((edu) => edu.id !== id),
        }));
    }, []);

    // Custom sections updates
    const addCustomSection = useCallback((section: ResumeConfig['customSections'][0]) => {
        setConfig((prev) => ({
            ...prev,
            customSections: [...prev.customSections, section],
        }));
    }, []);

    const updateCustomSection = useCallback(
        (id: string, patch: Partial<ResumeConfig['customSections'][0]>) => {
            setConfig((prev) => ({
                ...prev,
                customSections: prev.customSections.map((section) =>
                    section.id === id ? { ...section, ...patch } : section
                ),
            }));
        },
        []
    );

    const removeCustomSection = useCallback((id: string) => {
        setConfig((prev) => ({
            ...prev,
            customSections: prev.customSections.filter((section) => section.id !== id),
        }));
    }, []);

    // Section toggles
    const toggleSection = useCallback((id: string, enabled: boolean) => {
        setConfig((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === id ? { ...section, enabled } : section
            ),
        }));
    }, []);

    // Reorder sections
    const reorderSection = useCallback((id: string, direction: 'up' | 'down') => {
        setConfig((prev) => {
            const sections = [...prev.sections].sort((a, b) => a.order - b.order);
            const index = sections.findIndex((s) => s.id === id);

            if (index < 0) return prev;

            const nextIndex = direction === 'up' ? index - 1 : index + 1;

            if (nextIndex < 0 || nextIndex >= sections.length) return prev;

            const updated = [...sections];
            const [current] = updated.splice(index, 1);
            updated.splice(nextIndex, 0, current);

            return {
                ...prev,
                sections: updated.map((s, i) => ({ ...s, order: i })),
            };
        });
    }, []);

    // Font updates
    const updateFont = useCallback((fontFamily: string) => {
        setConfig((prev) => ({
            ...prev,
            fontFamily,
            sectionFonts: {
                summary: fontFamily,
                skills: fontFamily,
                experience: fontFamily,
                education: fontFamily,
            },
        }));
    }, []);

    const updateSectionFont = useCallback((section: string, fontFamily: string) => {
        setConfig((prev) => ({
            ...prev,
            sectionFonts: {
                ...prev.sectionFonts,
                [section]: fontFamily,
            } as ResumeConfig['sectionFonts'],
        }));
    }, []);

    // Image upload
    const uploadImage = useCallback(
        (file: File) => {
            const reader = new FileReader();

            reader.onload = () => {
                const dataUrl = String(reader.result ?? '');
                const image = new Image();

                image.onload = () => {
                    const imageData: ResumeImageLayer = {
                        id: uuid(),
                        dataUrl,
                        naturalWidth: image.naturalWidth,
                        naturalHeight: image.naturalHeight,
                        width: Math.min(120, image.naturalWidth),
                        height: Math.min(120, image.naturalHeight),
                        x: 0,
                        y: 0,
                    };
                    updateImage(imageData);
                };

                image.onerror = () => {
                    toast.error(`Failed to load image: ${file.name}`);
                };

                image.src = dataUrl;
            };

            reader.onerror = () => {
                toast.error(`Failed to read file: ${file.name}`);
            };

            reader.readAsDataURL(file);
        },
        [updateImage]
    );

    // Save/Load handlers
    const handleSaveResume = useCallback(() => {
        if (!resumeName.trim()) {
            toast.error('Please enter a resume name');
            return;
        }

        const isNew = !currentResumeIdRef.current;
        saveMutation.mutate(isNew);
    }, [resumeName, saveMutation]);

    const handleLoadResume = useCallback(
        (resumeId: string) => {
            loadMutation.mutate(resumeId);
        },
        [loadMutation]
    );

    const handleDeleteResume = useCallback(
        (resumeId: string) => {
            if (window.confirm('Are you sure you want to delete this resume?')) {
                deleteMutation.mutate(resumeId as $UUID);
            }
        },
        [deleteMutation]
    );

    return (
        <div className="grid gap-4 lg:grid-cols-3 max-w-full">
            {/* Controls */}
            <div className="lg:col-span-1 order-2 lg:order-1 max-h-[calc(100vh-6rem)] custom-scroll overflow-y-auto">
                <ResumeControls
                    config={config}
                    loadingResumes={savedResumesQuery.isLoading}
                    onCustomSectionAdd={addCustomSection}
                    onCustomSectionRemove={removeCustomSection}
                    onCustomSectionUpdate={updateCustomSection}
                    onDeleteResume={handleDeleteResume}
                    onEducationAdd={addEducation}
                    onEducationRemove={removeEducation}
                    onEducationUpdate={updateEducation}
                    onExperienceAdd={addExperience}
                    onExperienceRemove={removeExperience}
                    onExperienceUpdate={updateExperience}
                    onFontChange={updateFont}
                    onHeaderChange={updateHeader}
                    onLoadResume={handleLoadResume}
                    onSaveName={setResumeName}
                    onSaveResume={handleSaveResume}
                    onSectionFontChange={updateSectionFont}
                    onSectionReorder={reorderSection}
                    onSectionToggle={toggleSection}
                    onSkillAdd={addSkill}
                    onSkillRemove={removeSkill}
                    onSummaryChange={updateSummary}
                    onUploadImage={uploadImage}
                    resumeName={resumeName}
                    savedResumes={savedResumes}
                    savePending={saveMutation.isPending}
                    validationIssues={validationIssues}
                />
            </div>

            {/* Preview */}
            <div className="lg:col-span-2 order-1 lg:order-2 max-h-[calc(100vh-6rem)] custom-scroll overflow-y-auto">
                <ResumePrevier
                    config={config}
                    onImageChange={(patch) => {
                        setConfig((prev) => {
                            if (!patch) {
                                return {
                                    ...prev,
                                    header: {
                                        ...prev.header,
                                        image: undefined,
                                    },
                                };
                            }

                            return {
                                ...prev,
                                header: {
                                    ...prev.header,
                                    image: {
                                        ...(prev.header.image || {}),
                                        ...patch,
                                        id: patch.id || prev.header.image?.id || uuid(),
                                    } as ResumeConfig['header']['image'],
                                },
                            };
                        });
                    }}
                />
            </div>
        </div>
    );
}
