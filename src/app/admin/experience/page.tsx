import { db } from '@/lib/drizzle';
import { experiences } from '@/lib/drizzle/schema';
import { ExperiencesClient } from './_components/ExperiencesClient';

export default async function ExperiencePage() {
    const allExperiences = await db.select().from(experiences).orderBy(experiences.start_date);

    return <ExperiencesClient initialExperiences={allExperiences} />;
}
