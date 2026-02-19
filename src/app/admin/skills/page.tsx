import { asc } from 'drizzle-orm';
import { db } from '@/lib/drizzle';
import { skills } from '@/lib/drizzle/schema';
import type { SelectSkill } from '@/types/skills';
import { SkillsClient } from './_components/SkillsClient';

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
    let allSkills: SelectSkill[] = [];

    try {
        allSkills = await db
            .select()
            .from(skills)
            .orderBy(asc(skills.sort_order), asc(skills.title));
    } catch (error) {
        console.error('Error fetching skills:', error);
    }

    return <SkillsClient initialData={allSkills} />;
}
