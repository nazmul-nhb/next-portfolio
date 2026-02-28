import { desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import { db } from '@/lib/drizzle';
import { projects } from '@/lib/drizzle/schema';
import type { SelectProject } from '@/types/projects';
import { ProjectsClient } from './_components/ProjectsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Manage Projects » Admin Dashboard',
};

export default async function ProjectsPage() {
    let allProjects: SelectProject[] = [];

    try {
        allProjects = await db.select().from(projects).orderBy(desc(projects.created_at));
    } catch (error) {
        console.error('Error fetching projects:', error);
    }

    return <ProjectsClient initialProjects={allProjects} />;
}
