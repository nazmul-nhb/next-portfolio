import type { Metadata } from 'next';
import AgeCalculator from '@/app/tools/age-calculator/_components/AgeCalculator';

export const metadata: Metadata = {
    title: 'Age Calculator',
    description:
        'Calculate your age based on your birthdate, with options for detailed breakdown and future age prediction.',
};

export default function AgeCalculatorPage() {
    return <AgeCalculator />;
}
