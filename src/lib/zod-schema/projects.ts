import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';
import { projects } from '@/lib/drizzle/schema/projects';
import { createImageFileListSchema, ImageSchema } from '@/lib/zod-schema/files';

export const ProjectCreationSchema = createInsertSchema(projects)
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        repo_links: true,
        screenshots: true,
        tech_stack: true,
        features: true,
    })
    .extend({
        repo_links: z.tuple([z.string('First GitHub link is required'), z.string().optional()]),
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

export const ProjectCreationFields = ProjectCreationSchema.omit({
    favicon: true,
    screenshots: true,
})
    .extend({
        favicon: ImageSchema,
        screenshots: createImageFileListSchema({ exactCount: 3 }),
    })
    .strict();

export const ProjectUpdateFields = ProjectCreationFields.partial();
