import { uuid } from 'nhb-toolbox/hash';
import type { ResumeConfig } from './types';

export const DEFAULT_RESUME_CONFIG = {
    header: {
        fullName: 'Your Name',
        jobTitle: 'Your Job Title',
        email: 'your.email@example.com',
        phone: '+8801623732187',
        location: 'City, Country',
        website: 'https://www.nazmul-nhb.dev',
        linkedin: '',
        github: '',
    },
    summary:
        'A passionate professional with a track record of delivering innovative solutions. Proficient in modern technologies and committed to continuous learning and professional excellence.',
    skills: [
        { id: uuid(), name: 'JavaScript' },
        { id: uuid(), name: 'TypeScript' },
        { id: uuid(), name: 'React' },
        { id: uuid(), name: 'Node.js' },
    ],
    experience: [
        {
            id: uuid(),
            company: 'Tech Company',
            position: 'Senior Developer',
            startDate: '2023-01',
            endDate: '2025-12',
            current: true,
            description:
                'Led development of new features and improvements. Collaborated with cross-functional teams to deliver high-quality solutions.',
        },
    ],
    education: [
        {
            id: uuid(),
            school: 'University Name',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            startDate: '2018-01',
            endDate: '2022-05',
            current: false,
            description: '',
        },
    ],
    customSections: [],
    sections: [
        { id: 'summary', enabled: true, order: 0 },
        { id: 'skills', enabled: true, order: 1 },
        { id: 'experience', enabled: true, order: 2 },
        { id: 'education', enabled: true, order: 3 },
    ],
    fontFamily: 'system-ui',
    sectionFonts: {
        summary: 'system-ui',
        skills: 'system-ui',
        experience: 'system-ui',
        education: 'system-ui',
    },
} satisfies ResumeConfig;

/**
 * Font options for resume (similar to photo card fonts)
 */
export const RESUME_FONT_OPTIONS = [
    {
        value: 'system-ui',
        label: 'System UI',
        fontFamily: 'system-ui',
    },
    {
        value: 'inter',
        label: 'Inter',
        fontFamily: 'Inter',
    },
    {
        value: 'poppins',
        label: 'Poppins',
        fontFamily: 'Poppins',
    },
    {
        value: 'playfair',
        label: 'Playfair',
        fontFamily: '"Playfair Display"',
    },
    {
        value: 'roboto-mono',
        label: 'Roboto Mono',
        fontFamily: '"Roboto Mono"',
    },
    {
        value: 'source-sans',
        label: 'Source Sans',
        fontFamily: '"Source Sans"',
    },
    {
        value: 'cascadia-code',
        label: 'Cascadia Code',
        fontFamily: '"Cascadia Code"',
    },
    {
        value: 'geist-sans',
        label: 'Geist Sans',
        fontFamily: '"Geist Sans"',
    },
    {
        value: 'geist-mono',
        label: 'Geist Mono',
        fontFamily: '"Geist Mono"',
    },
] as const;

/**
 * Custom field type options
 */
export const CUSTOM_FIELD_TYPE_OPTIONS = [
    {
        value: 'text',
        label: 'Text Input',
        description: 'Single line text input',
    },
    {
        value: 'textarea',
        label: 'Textarea',
        description: 'Multi-line descriptive text',
    },
    {
        value: 'list',
        label: 'List',
        description: 'Array of items (each on new line)',
    },
] as const;

/**
 * Default section labels
 */
export const DEFAULT_SECTION_LABELS = {
    summary: 'Professional Summary',
    skills: 'Skills',
    experience: 'Experience',
    education: 'Education',
} as const;
