import { db } from '@/lib/drizzle';
import { categories } from '@/lib/drizzle/schema/blogs';
import { CategoriesClient } from './_components/CategoriesClient';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
    let allCategories: (typeof categories.$inferSelect)[] = [];

    try {
        allCategories = await db.select().from(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }

    return <CategoriesClient initialData={allCategories} />;
}
