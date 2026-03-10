import type { Metadata } from 'next';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import DifferenceCalculator from './_components/DifferenceCalculator';

const description =
    'Calculate the difference between two dates in any time unit (years, months, weeks, days, hours, minutes, seconds, or milliseconds).';

export const metadata: Metadata = {
    title: 'Difference Calculator',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'difference calculator',
        'date difference',
        'time difference',
        'chronos diff',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/difference-calculator') },
    openGraph: {
        title: `Difference Calculator from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/difference-calculator'),
        siteName: siteConfig.name,
    },
};

export default function DifferenceCalculatorPage() {
    return <DifferenceCalculator />;
}
