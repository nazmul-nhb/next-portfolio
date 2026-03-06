import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ExpensesClient } from './_components/ExpensesClient';

export const metadata: Metadata = {
    title: 'Expense Manager',
    description: 'Track income, expenses, loans, repayments, and cash in hand.',
};

export default async function ExpensesPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth/login?redirectTo=/tools');
    }

    return <ExpensesClient />;
}
