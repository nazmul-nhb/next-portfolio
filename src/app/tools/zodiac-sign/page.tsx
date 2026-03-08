import type { Metadata } from 'next';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import ZodiacFinder from './_components/ZodiacFinder';

const description =
    'Find a matching zodiac sign from a birth date using western or vedic presets, with date ranges and traditional sign descriptions.';

export const metadata: Metadata = {
    title: 'Zodiac Sign Finder',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'zodiac sign finder',
        'western zodiac',
        'vedic zodiac',
        'birth date zodiac sign',
        'zodiac preset',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/zodiac-sign') },
    openGraph: {
        title: `Zodiac Sign Finder from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/zodiac-sign'),
        siteName: siteConfig.name,
    },
};

export default function ZodiacSignPage() {
    return <ZodiacFinder />;
}
