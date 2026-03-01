import type { Metadata } from 'next';
import { httpRequest } from '@/lib/actions/baseRequest';
import type { SelectCategory } from '@/types/blogs';
import { CategoriesClient } from './_components/CategoriesClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Manage Blog Categories',
};

export default async function CategoriesPage() {
    let allCategories: SelectCategory[] = [];

    try {
        const { data } = await httpRequest<SelectCategory[]>('/api/categories');

        if (data) {
            allCategories = data;
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }

    return <CategoriesClient initialData={allCategories} />;
}
