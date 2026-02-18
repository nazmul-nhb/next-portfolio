import { desc } from 'drizzle-orm';
import { db } from '@/lib/drizzle';
import { projects } from '@/lib/drizzle/schema';
import type { SelectProject } from '@/types/projects';
import { ProjectsClient } from './_components/ProjectsClient';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
    let allProjects: SelectProject[] = [];

    try {
        allProjects = await db.select().from(projects).orderBy(desc(projects.created_at));
    } catch (error) {
        console.error('Error fetching projects:', error);
    }

    return <ProjectsClient initialProjects={allProjects} />;
}
