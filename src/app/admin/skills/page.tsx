import { db } from '@/lib/drizzle';
import { skills } from '@/lib/drizzle/schema';
import { SkillsClient } from './_components/SkillsClient';

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
    let allSkills: (typeof skills.$inferSelect)[] = [];

    try {
        allSkills = await db.select().from(skills).orderBy(skills.title);
    } catch (error) {
        console.error('Error fetching skills:', error);
    }

    return <SkillsClient initialSkills={allSkills} />;
}
