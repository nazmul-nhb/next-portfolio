import type { Metadata } from 'next';
import { Suspense } from 'react';
import Loading from '@/components/misc/loading';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import ManageUUID from './_components/ManageUUID';

const description = 'Generate and decode UUIDs across all RFC 4122 versions (v1, v3-v8).';

export const metadata: Metadata = {
    title: 'UUID Generator & Decoder',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'uuid',
        'uuid generator',
        'uuid decoder',
        'uuid v1',
        'uuid v3',
        'uuid v4',
        'uuid v5',
        'uuid v6',
        'uuid v7',
        'uuid v8',
        'RFC 4122',
        'uuid tools',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/uuid') },
    openGraph: {
        title: `UUID Generator & Decoder from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/uuid'),
        siteName: siteConfig.name,
    },
};

export default function UUIDPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ManageUUID />
        </Suspense>
    );
}
