import type { Metadata } from 'next';
import { Suspense } from 'react';
import Loading from '@/components/misc/loading';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import ManagePhotoCards from './_components/ManagePhotoCards';

const description =
    'Create polished photo cards with layered images, custom typography, live preview, and more.';

export const metadata: Metadata = {
    title: 'Photo Card Generator',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'photo card',
        'photo card generator',
        'canvas designer',
        'image text editor',
        'browser photo editor',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/photo-card') },
    openGraph: {
        title: `Photo Card Generator from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/photo-card'),
        siteName: siteConfig.name,
    },
};

export default function PhotoCardPage() {
    return (
        <Suspense fallback={<Loading />} name="Photo Card Page">
            <ManagePhotoCards />
        </Suspense>
    );
}
