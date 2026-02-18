import { desc } from 'drizzle-orm';
import { db } from '@/lib/drizzle';
import { skills } from '@/lib/drizzle/schema';
import type { SelectSkill } from '@/types/skills';
import { SkillsClient } from './_components/SkillsClient';

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
    let allSkills: SelectSkill[] = [];

    try {
        allSkills = await db.select().from(skills).orderBy(desc(skills.created_at));
    } catch (error) {
        console.error('Error fetching skills:', error);
    }

    return <SkillsClient initialData={allSkills} />;
}
