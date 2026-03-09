import { uuid } from 'nhb-toolbox/hash';
import { DEFAULT_RESUME_CONFIG } from './defaults';
import type {
    CustomSection,
    ResumeConfig,
    ResumeEducationItem,
    ResumeExperienceItem,
    ResumeSkillItem,
} from './types';

/**
 * Normalize and validate resume config
 */
export function normalizeResumeConfig(config: Partial<ResumeConfig>): ResumeConfig {
    return {
        header: {
            ...DEFAULT_RESUME_CONFIG.header,
            ...config.header,
        },
        summary: config.summary || DEFAULT_RESUME_CONFIG.summary,
        skills: config.skills || DEFAULT_RESUME_CONFIG.skills,
        experience: config.experience || DEFAULT_RESUME_CONFIG.experience,
        education: config.education || DEFAULT_RESUME_CONFIG.education,
        customSections: config.customSections || [],
        sections: config.sections || DEFAULT_RESUME_CONFIG.sections,
        fontFamily: config.fontFamily || DEFAULT_RESUME_CONFIG.fontFamily,
        sectionFonts: {
            ...DEFAULT_RESUME_CONFIG.sectionFonts,
            ...config.sectionFonts,
        },
    };
}

/**
 * Add a new skill
 */
export function addSkill(skills: ResumeSkillItem[], name: string): ResumeSkillItem[] {
    return [...skills, { id: uuid(), name }];
}

/**
 * Update a skill
 */
export function updateSkill(
    skills: ResumeSkillItem[],
    id: string,
    patch: Partial<ResumeSkillItem>
): ResumeSkillItem[] {
    return skills.map((skill) => (skill.id === id ? { ...skill, ...patch } : skill));
}

/**
 * Remove a skill
 */
export function removeSkill(skills: ResumeSkillItem[], id: string): ResumeSkillItem[] {
    return skills.filter((skill) => skill.id !== id);
}

/**
 * Add an experience entry
 */
export function addExperience(
    experience: ResumeExperienceItem[],
    entry: Omit<ResumeExperienceItem, 'id'>
): ResumeExperienceItem[] {
    return [...experience, { ...entry, id: uuid() }];
}

/**
 * Update an experience entry
 */
export function updateExperience(
    experience: ResumeExperienceItem[],
    id: string,
    patch: Partial<ResumeExperienceItem>
): ResumeExperienceItem[] {
    return experience.map((exp) => (exp.id === id ? { ...exp, ...patch } : exp));
}

/**
 * Remove an experience entry
 */
export function removeExperience(
    experience: ResumeExperienceItem[],
    id: string
): ResumeExperienceItem[] {
    return experience.filter((exp) => exp.id !== id);
}

/**
 * Add an education entry
 */
export function addEducation(
    education: ResumeEducationItem[],
    entry: Omit<ResumeEducationItem, 'id'>
): ResumeEducationItem[] {
    return [...education, { ...entry, id: uuid() }];
}

/**
 * Update an education entry
 */
export function updateEducation(
    education: ResumeEducationItem[],
    id: string,
    patch: Partial<ResumeEducationItem>
): ResumeEducationItem[] {
    return education.map((edu) => (edu.id === id ? { ...edu, ...patch } : edu));
}

/**
 * Remove an education entry
 */
export function removeEducation(
    education: ResumeEducationItem[],
    id: string
): ResumeEducationItem[] {
    return education.filter((edu) => edu.id !== id);
}

/**
 * Add a custom section
 */
export function addCustomSection(
    sections: CustomSection[],
    title: string,
    fieldType: 'text' | 'textarea' | 'list'
): CustomSection[] {
    return [
        ...sections,
        {
            id: uuid(),
            title,
            fieldType,
            value: fieldType === 'list' ? [] : '',
        },
    ];
}

/**
 * Update a custom section
 */
export function updateCustomSection(
    sections: CustomSection[],
    id: string,
    patch: Partial<CustomSection>
): CustomSection[] {
    return sections.map((section) => (section.id === id ? { ...section, ...patch } : section));
}

/**
 * Remove a custom section
 */
export function removeCustomSection(sections: CustomSection[], id: string): CustomSection[] {
    return sections.filter((section) => section.id !== id);
}

/**
 * Reorder items in an array
 */
export function reorderItems<T extends { id: string }>(
    items: T[],
    id: string,
    direction: 'up' | 'down'
): T[] {
    const index = items.findIndex((item) => item.id === id);

    if (index < 0) return items;

    const nextIndex = direction === 'up' ? index - 1 : index + 1;

    if (nextIndex < 0 || nextIndex >= items.length) return items;

    const nextItems = [...items];
    const [current] = nextItems.splice(index, 1);

    nextItems.splice(nextIndex, 0, current);

    return nextItems;
}

/**
 * Format date for display
 */
export function formatDateRange(startDate: string, endDate: string, current: boolean): string {
    if (current) {
        return `${startDate} - Present`;
    }
    return `${startDate} - ${endDate}`;
}
