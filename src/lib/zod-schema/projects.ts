import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';
import { projects } from '@/lib/drizzle/schema/projects';
import { ImageSchema, ScreenShotsSchema } from '@/lib/zod-schema/files';

export const ProjectCreationSchema = createInsertSchema(projects)
    .omit({
        id: true,
        created_at: true,
        live_link: true,
        updated_at: true,
        repo_links: true,
        screenshots: true,
        tech_stack: true,
        features: true,
    })
    .extend({
        live_link: z.url('Live link must be a valid URL'),
        repo_links: z.tuple([
            z.url('First Repository link is required'),
            z.union([z.url('Invalid repository link').optional(), z.literal('')]).optional(),
        ]),
        screenshots: z.tuple([
            z.string('Screenshot 1 is required'),
            z.string('Screenshot 2 is required'),
            z.string('Screenshot 3 is required'),
        ]),
        tech_stack: z.array(z.string()).min(1, 'Minimum 1 technology required'),
        features: z.array(z.string()).min(1, 'Minimum 1 feature required'),
    })
    .strict();

export const ProjectUpdateSchema = ProjectCreationSchema.partial();

export const ProjectFormSchema = ProjectCreationSchema.omit({
    favicon: true,
    screenshots: true,
})
    .extend({
        favicon: ImageSchema,
        screenshots: ScreenShotsSchema,
    })
    .strict();

export const ProjectFormUpdateSchema = ProjectFormSchema.partial();

export type ProjectFormData = z.infer<typeof ProjectFormSchema>;
