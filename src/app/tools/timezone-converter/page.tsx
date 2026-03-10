import type { Metadata } from 'next';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import TimezoneConverter from './_components/TimezoneConverter';

const description =
    'Compare current time across multiple timezones with live updates. Supports IANA identifiers, abbreviations, and custom UTC offsets.';

export const metadata: Metadata = {
    title: 'Timezone Converter',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'timezone converter',
        'timezone comparison',
        'time zone',
        'time converter',
        'chronos timezone',
        'live clock',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/timezone-converter') },
    openGraph: {
        title: `Timezone Converter from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/timezone-converter'),
        siteName: siteConfig.name,
    },
};

export default function TimezoneConverterPage() {
    return <TimezoneConverter />;
}
