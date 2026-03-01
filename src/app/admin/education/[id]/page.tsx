import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/drizzle';
import { education } from '@/lib/drizzle/schema';
import type { SelectEducation } from '@/types/career';
import { EditEducationClient } from './_components/EditEducationClient';

export const metadata: Metadata = {
    title: 'Edit Education',
};

export default async function EditEducationPage({
    params,
}: PageProps<'/admin/education/[id]'>) {
    const { id } = await params;
    const educationId = +id;

    if (Number.isNaN(educationId)) {
        notFound();
    }

    const [educationEntry] = await db
        .select()
        .from(education)
        .where(eq(education.id, educationId));

    if (!educationEntry) {
        notFound();
    }

    return <EditEducationClient education={educationEntry as unknown as SelectEducation} />;
}
