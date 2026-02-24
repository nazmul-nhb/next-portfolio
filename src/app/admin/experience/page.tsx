import { notFound } from 'next/navigation';
import { httpRequest } from '@/lib/actions/baseRequest';
import type { SelectExperience } from '@/types/career';
import { ExperiencesClient } from './_components/ExperiencesClient';

export const dynamic = 'force-dynamic';

export default async function ExperiencePage() {
    try {
        let allExperiences: SelectExperience[] = [];

        const { data } = await httpRequest<SelectExperience[]>('/api/experience');

        if (data) {
            allExperiences = data;
        }

        return <ExperiencesClient initialExperiences={allExperiences} />;
    } catch (error) {
        console.error('Error fetching experiences:', error);
        notFound();
    }
}
