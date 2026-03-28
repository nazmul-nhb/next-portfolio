import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/drizzle';
import { skills } from '@/lib/drizzle/schema';
import type { Params } from '@/types';
import { EditSkillClient } from './_components/EditSkillClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Edit Skill',
};

export default async function EditSkillPage({ params }: Params) {
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
