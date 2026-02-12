import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db } from '@/lib/drizzle';
import { skills } from '@/lib/drizzle/schema';
import { EditSkillClient } from './_components/EditSkillClient';

export const dynamic = 'force-dynamic';

export default async function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const id = +resolvedParams.id;

    if (Number.isNaN(id)) {
        notFound();
    }

    let skill: typeof skills.$inferSelect | undefined;
    try {
        const result = await db.select().from(skills).where(eq(skills.id, id)).limit(1);
        skill = result[0];
    } catch (error) {
        console.error('Error fetching skill:', error);
        notFound();
    }

    if (!skill) {
        notFound();
    }

    return <EditSkillClient skill={skill} />;
}
