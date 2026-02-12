import { db } from '@/lib/drizzle';
import { education } from '@/lib/drizzle/schema';
import { EducationClient } from './_components/EducationClient';

export default async function EducationPage() {
    const allEducation = await db.select().from(education).orderBy(education.start_date);

    return <EducationClient initialEducation={allEducation} />;
}
