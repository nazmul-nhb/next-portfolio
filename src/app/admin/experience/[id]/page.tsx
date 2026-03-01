import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/drizzle';
import { experiences } from '@/lib/drizzle/schema';
import type { SelectExperience } from '@/types/career';
import { EditExperienceClient } from './_components/EditExperienceClient';

export const metadata: Metadata = {
    title: 'Edit Experience',
};

export default async function EditExperiencePage({
    params,
}: PageProps<'/admin/experience/[id]'>) {
    const { id } = await params;
    const experienceId = +id;

    if (Number.isNaN(experienceId)) {
        notFound();
    }

    const [experience] = await db
        .select()
        .from(experiences)
        .where(eq(experiences.id, experienceId));

    if (!experience) {
        notFound();
    }

    return <EditExperienceClient experience={experience as unknown as SelectExperience} />;
}
