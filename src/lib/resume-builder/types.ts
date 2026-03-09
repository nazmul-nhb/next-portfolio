/** Value field types for custom sections */
export type CustomFieldType = 'text' | 'textarea' | 'list';

/** Individual item in a list field */
export interface ListItem {
    id: string;
    value: string;
}

/** Value for a custom field depending on its type */
export type CustomFieldValue = string | ListItem[];

/** Custom section that user defines */
export interface CustomSection {
    id: string;
    title: string;
    fieldType: CustomFieldType;
    value: CustomFieldValue;
}

/** Default supported sections */
export type DefaultSectionId = 'summary' | 'skills' | 'experience' | 'education';

/** Represents a resumable section with enabled/disabled state and order */
export interface ResumeSection {
    id: DefaultSectionId;
    enabled: boolean;
    order: number;
}

/** Image layer for resume */
export interface ResumeImageLayer {
    id: string;
    dataUrl: string;
    x: number;
    y: number;
    width: number;
    height: number;
    naturalWidth: number;
    naturalHeight: number;
}

/** Resume header with contact info */
export interface ResumeHeader {
    fullName: string;
    jobTitle: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    image?: ResumeImageLayer;
}

/** Skill item */
export interface ResumeSkillItem {
    id: string;
    name: string;
}

/** Experience entry */
export interface ResumeExperienceItem {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

/** Education entry */
export interface ResumeEducationItem {
    id: string;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description?: string;
}

/** Main resume configuration */
export interface ResumeConfig {
    header: ResumeHeader;
    summary: string;
    skills: ResumeSkillItem[];
    experience: ResumeExperienceItem[];
    education: ResumeEducationItem[];
    customSections: CustomSection[];
    sections: ResumeSection[];
    fontFamily: string;
    sectionFonts: Record<DefaultSectionId, string>;
}

/** Saved resume with metadata */
export interface SavedResume {
    id: string;
    name: string;
    config: ResumeConfig;
    createdAt: Date;
    updatedAt: Date;
}
