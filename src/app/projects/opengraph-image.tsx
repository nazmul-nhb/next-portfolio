import { ImageResponse } from 'next/og';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import { OgImageLayout } from '../_og/OgImageLayout';

export const runtime = 'edge';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        <OgImageLayout
            description={`Explore ${siteConfig.name}'s projects.`}
            siteTitle={`Projects » ${siteConfig.name}`}
            tag={`${siteConfig.name}'s Projects`}
            title={`${siteConfig.name}'s Projects`}
            url={buildCanonicalUrl('/projects')}
        />
    );
}
