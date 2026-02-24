import { notFound } from 'next/navigation';
import { httpRequest } from '@/lib/actions/baseRequest';
import type { SelectEducation } from '@/types/career';
import { EducationClient } from './_components/EducationClient';

export const dynamic = 'force-dynamic';

export default async function EducationPage() {
    try {
        let allEducation: SelectEducation[] = [];

        const { data } = await httpRequest<SelectEducation[]>('/api/education');

        if (data) {
            allEducation = data;
        }

        return <EducationClient initialEducation={allEducation} />;
    } catch (error) {
        console.error('Error fetching education:', error);
        notFound();
    }
}
