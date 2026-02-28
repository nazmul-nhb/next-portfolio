import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/drizzle';
import { projects } from '@/lib/drizzle/schema';
import { EditProjectClient } from './_components/EditProjectClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Edit Project » Admin Dashboard',
};

export default async function EditProjectPage({ params }: PageProps<'/admin/projects/[id]'>) {
    const resolvedParams = await params;
    const id = +resolvedParams.id;

    if (Number.isNaN(id)) {
        notFound();
    }

    let project: typeof projects.$inferSelect | undefined;
    try {
        const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
        project = result[0];
    } catch (error) {
        console.error('Error fetching project:', error);
        notFound();
    }

    if (!project) {
        notFound();
    }

    return <EditProjectClient project={project} />;
}
