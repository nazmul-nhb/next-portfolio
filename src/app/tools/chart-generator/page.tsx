import type { Metadata } from 'next';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import ChartGenerator from './_components/ChartGenerator';

const description =
    'Create beautiful, interactive charts and graphs from JSON data. Support for bar, line, area, pie, scatter, and more. Export as SVG or PNG.';

export const metadata: Metadata = {
    title: 'Chart Generator',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'chart generator',
        'graph generator',
        'data visualization',
        'chart maker',
        'json to chart',
        'interactive charts',
        'chart export',
        'data visualization tool',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/chart-generator') },
    openGraph: {
        title: `Chart Generator from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/chart-generator'),
        siteName: siteConfig.name,
    },
};

export default function ChartGeneratorPage() {
    return (
        <div className="space-y-8">
            <TitleWithShare
                description={description}
                route="/tools/chart-generator"
                title="Chart Generator"
            />
            <ChartGenerator />
        </div>
    );
}
