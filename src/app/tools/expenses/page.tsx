import type { Metadata } from 'next';
import { ExpensesClient } from './_components/ExpensesClient';

export const metadata: Metadata = {
    title: 'Expense Manager',
    description: 'Track income, expenses, loans, repayments, and cash in hand.',
};

export default function ExpensesPage() {
    return <ExpensesClient />;
}
