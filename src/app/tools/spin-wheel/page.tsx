import type { Metadata } from 'next';
import { Suspense } from 'react';
import Loading from '@/components/misc/loading';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import SpinningWheel from './_components/SpinningWheel';

const description =
    'Make random decisions with an interactive spinning wheel. Add custom options, spin to pick a random choice, and share your wheel with others.';

export const metadata: Metadata = {
    title: 'Spinning Wheel',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'spinning wheel',
        'decision maker',
        'random picker',
        'wheel of fortune',
        'random choice',
        'decision wheel',
        'choice picker',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/spin-wheel') },
    openGraph: {
        title: `Spinning Wheel from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/spin-wheel'),
        siteName: siteConfig.name,
    },
};

export default function SpinningWheelPage() {
    return (
        <Suspense fallback={<Loading />} name="Spinning Wheel Page">
            <SpinningWheel />
        </Suspense>
    );
}
