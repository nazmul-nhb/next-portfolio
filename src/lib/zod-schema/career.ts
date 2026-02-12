import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';
import { education, experiences } from '@/lib/drizzle/schema/career';

// Experience Schemas
export const ExperienceCreationSchema = createInsertSchema(experiences)
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        technologies: true,
        achievements: true,
    })
    .extend({
        technologies: z.array(z.string()).min(1, 'At least 1 technology required'),
        achievements: z.array(z.string()).min(1, 'At least 1 achievement required'),
    })
    .strict();

export const ExperienceUpdateSchema = ExperienceCreationSchema.partial();

export const ExperienceFormSchema = ExperienceCreationSchema.omit({
    company_logo: true,
})
    .extend({
        company_logo: z.custom<FileList>().optional(),
    })
    .strict();

export const ExperienceFormUpdateSchema = ExperienceFormSchema.partial();

// Education Schemas
export const EducationCreationSchema = createInsertSchema(education)
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        achievements: true,
    })
    .extend({
        achievements: z.array(z.string()).optional(),
    })
    .strict();

export const EducationUpdateSchema = EducationCreationSchema.partial();

export const EducationFormSchema = EducationCreationSchema.omit({
    institution_logo: true,
})
    .extend({
        institution_logo: z.custom<FileList>().optional(),
    })
    .strict();

export const EducationFormUpdateSchema = EducationFormSchema.partial();

export type ExperienceFormData = z.infer<typeof ExperienceFormSchema>;
export type EducationFormData = z.infer<typeof EducationFormSchema>;
