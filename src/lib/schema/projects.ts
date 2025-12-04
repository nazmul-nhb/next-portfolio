import { createInsertSchema } from 'drizzle-zod';
import { projects } from '@/lib/drizzle/schema/projects';

export const ProjectCreationSchema = createInsertSchema(projects).omit({
    id: true,
    created_at: true,
    updated_at: true,
});
