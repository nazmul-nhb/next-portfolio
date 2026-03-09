import { uuid } from 'nhb-toolbox/hash';
import { DEFAULT_RESUME_CONFIG, RESUME_FONT_OPTIONS } from './defaults';
import type {
    CustomSection,
    DefaultSectionId,
    ResumeConfig,
    ResumeEducationItem,
    ResumeExperienceItem,
    ResumeSkillItem,
} from './types';

function resolveResumeFontFamily(value: string | undefined, fallback: string): string {
    if (!value) {
        return fallback;
    }

    const matchedFont = RESUME_FONT_OPTIONS.find(
        (option) => option.value === value || option.fontFamily === value
    );

    return matchedFont?.fontFamily ?? value;
}

/**
 * Normalize and validate resume config
 */
export function normalizeResumeConfig(config: Partial<ResumeConfig>): ResumeConfig {
    const normalizedFontFamily = resolveResumeFontFamily(
        config.fontFamily,
        DEFAULT_RESUME_CONFIG.fontFamily
    );
    const normalizedSectionFonts = (
        Object.keys(DEFAULT_RESUME_CONFIG.sectionFonts) as DefaultSectionId[]
    ).reduce(
        (accumulator, sectionId) => {
            accumulator[sectionId] = resolveResumeFontFamily(
                config.sectionFonts?.[sectionId],
                normalizedFontFamily
            );
            return accumulator;
        },
        {} as ResumeConfig['sectionFonts']
    );

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
        fontFamily: normalizedFontFamily,
        sectionFonts: normalizedSectionFonts,
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

/**
 * Sort sections by configured order.
 */
export function sortResumeSections<T extends { order: number }>(sections: T[]): T[] {
    return [...sections].sort((a, b) => a.order - b.order);
}

/**
 * Format a YYYY-MM string to a readable month label.
 */
export function formatResumeMonthLabel(value: string): string {
    if (!value) {
        return '';
    }

    const [year, month] = value.split('-');

    if (!year || !month) {
        return value;
    }

    const date = new Date(Number(year), Number(month) - 1, 1);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        year: 'numeric',
    }).format(date);
}

/**
 * Format a date range using readable month labels.
 */
export function formatResumeDateRange(
    startDate: string,
    endDate: string,
    current: boolean
): string {
    const start = formatResumeMonthLabel(startDate);

    if (!start) {
        return current ? 'Present' : formatResumeMonthLabel(endDate);
    }

    if (current) {
        return `${start} - Present`;
    }

    const end = formatResumeMonthLabel(endDate);

    return end ? `${start} - ${end}` : start;
}

/**
 * Ensure external links are valid for anchors and PDF links.
 */
export function normalizeResumeHref(value: string): string {
    if (!value) {
        return '';
    }

    if (
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('mailto:') ||
        value.startsWith('tel:')
    ) {
        return value;
    }

    return `https://${value}`;
}

/**
 * Reduce a contact URL to a cleaner label.
 */
export function formatResumeLinkLabel(value: string): string {
    return value
        .replace(/^https?:\/\//, '')
        .replace(/^mailto:/, '')
        .replace(/^tel:/, '')
        .replace(/\/$/, '');
}

/**
 * Map CSS/web font choices to react-pdf built-in font families.
 */
export function getResumePdfFontFamily(value: string): 'Courier' | 'Helvetica' | 'Times-Roman' {
    const normalized = value.toLowerCase();

    if (normalized.includes('mono') || normalized.includes('cascadia')) {
        return 'Courier';
    }

    if (normalized.includes('playfair') || normalized.includes('times')) {
        return 'Times-Roman';
    }

    return 'Helvetica';
}
