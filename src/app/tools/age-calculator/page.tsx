import type { Metadata } from 'next';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import AgeCalculator from './_components/AgeCalculator';

const description =
    'Calculate your age based on your birthdate, with options for detailed breakdown and future age prediction.';

export const metadata: Metadata = {
    title: 'Age Calculator',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'age calculator',
        'age prediction',
        'age breakdown',
        'birthdate age calculator',
        'future age calculator',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/age-calculator') },
    openGraph: {
        title: `Age Calculator from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/age-calculator'),
        siteName: siteConfig.name,
    },
};

export default function AgeCalculatorPage() {
    return <AgeCalculator />;
}
