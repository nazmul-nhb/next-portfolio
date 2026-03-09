import { z } from 'zod';
import type {
    CustomSection,
    ResumeConfig,
    ResumeEducationItem,
    ResumeExperienceItem,
    ResumeHeader,
    ResumeImageLayer,
    ResumeSkillItem,
} from './types';

const ResumeImageLayerSchema = z.object({
    id: z.string().min(1),
    dataUrl: z.string().startsWith('data:'),
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    naturalWidth: z.number().int().positive(),
    naturalHeight: z.number().int().positive(),
}) satisfies z.ZodType<ResumeImageLayer>;

const ResumeHeaderSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    jobTitle: z.string().min(1, 'Job title is required'),
    email: z.string().email('Invalid email').optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: z.string().url('Invalid URL').optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    image: ResumeImageLayerSchema.optional(),
}) satisfies z.ZodType<ResumeHeader>;

const ResumeSkillItemSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1, 'Skill name is required'),
}) satisfies z.ZodType<ResumeSkillItem>;

const ResumeExperienceItemSchema = z.object({
    id: z.string().min(1),
    company: z.string().min(1, 'Company is required'),
    position: z.string().min(1, 'Position is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string(),
    current: z.boolean(),
    description: z.string().min(1, 'Description is required'),
}) satisfies z.ZodType<ResumeExperienceItem>;

const ResumeEducationItemSchema = z.object({
    id: z.string().min(1),
    school: z.string().min(1, 'School is required'),
    degree: z.string().min(1, 'Degree is required'),
    field: z.string().min(1, 'Field of study is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string(),
    current: z.boolean(),
    description: z.string().optional(),
}) satisfies z.ZodType<ResumeEducationItem>;

const CustomSectionSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1, 'Section title is required'),
    fieldType: z.enum(['text', 'textarea', 'list']),
    value: z.union([
        z.string(),
        z.array(
            z.object({
                id: z.string().min(1),
                value: z.string().min(1),
            })
        ),
    ]),
}) satisfies z.ZodType<CustomSection>;

const ResumeSectionSchema = z.object({
    id: z.enum(['summary', 'skills', 'experience', 'education']),
    enabled: z.boolean(),
    order: z.number().int().nonnegative(),
});

export const ResumeConfigSchema = z.object({
    header: ResumeHeaderSchema,
    summary: z.string().min(1, 'Professional summary is required'),
    skills: z.array(ResumeSkillItemSchema),
    experience: z.array(ResumeExperienceItemSchema),
    education: z.array(ResumeEducationItemSchema),
    customSections: z.array(CustomSectionSchema),
    sections: z.array(ResumeSectionSchema),
    fontFamily: z.string(),
    sectionFonts: z.record(
        z.enum(['summary', 'skills', 'experience', 'education']),
        z.string()
    ),
}) satisfies z.ZodType<ResumeConfig>;

export type ResumeConfigSchemaType = z.infer<typeof ResumeConfigSchema>;
