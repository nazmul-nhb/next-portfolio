import { db } from '@/lib/drizzle';
import { projects } from '@/lib/drizzle/schema';
import { ProjectsClient } from './_components/ProjectsClient';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
    let allProjects: (typeof projects.$inferSelect)[] = [];

    try {
        allProjects = await db.select().from(projects).orderBy(projects.created_at);
    } catch (error) {
        console.error('Error fetching projects:', error);
    }

    return <ProjectsClient initialProjects={allProjects} />;
}
