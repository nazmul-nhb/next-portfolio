import { createInsertSchema } from 'drizzle-zod';
import { skills } from '@/lib/drizzle/schema/skills';

export const SkillCreationSchema = createInsertSchema(skills)
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
    })
    .strict();

export const SkillUpdateSchema = SkillCreationSchema.partial();
