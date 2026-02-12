import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db } from '@/lib/drizzle';
import { experiences } from '@/lib/drizzle/schema';
import { EditExperienceClient } from './_components/EditExperienceClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditExperiencePage({ params }: PageProps) {
    const { id } = await params;
    const experienceId = Number.parseInt(id, 10);

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

    return <EditExperienceClient experience={experience} />;
}
