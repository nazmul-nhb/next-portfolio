import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { siteConfig } from '@/configs/site';
import { auth } from '@/lib/auth';
import { buildCanonicalUrl } from '@/lib/utils';
import { ExpensesClient } from './_components/ExpensesClient';

const description = 'Track income, expenses, loans, repayments, and cash in hand.';

export const metadata: Metadata = {
    title: 'Expense Manager',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'expense',
        'loan',
        'expense manager',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/expense-manager') },
    openGraph: {
        title: `Expense Manager from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/expense-manager'),
        siteName: siteConfig.name,
    },
};

export default async function ExpensesPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth/login?redirectTo=/tools/expense-manager');
    }

    return <ExpensesClient />;
}
