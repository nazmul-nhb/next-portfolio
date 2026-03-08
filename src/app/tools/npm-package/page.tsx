import type { Metadata } from 'next';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import NpmPackageDetails from './_components/PackageDetails';
import { Suspense } from 'react';
import Loading from '@/components/misc/loading';

const description =
    'Search for any npm package and view comprehensive details including downloads, maintainers, repository, license, keywords, and more.';

export const metadata: Metadata = {
    title: 'NPM Package Details',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'npm package',
        'package details',
        'npm search',
        'package information',
        'npm downloads',
        'package analysis',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/npm-package') },
    openGraph: {
        title: `NPM Package Details from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/npm-package'),
        siteName: siteConfig.name,
    },
};

export default function NpmPackagePage() {
    return (
        <Suspense fallback={<Loading />}>
            <NpmPackageDetails />
        </Suspense>
    );
}
