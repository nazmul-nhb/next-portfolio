import { ImageResponse } from 'next/og';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import { OgImageLayout } from '../_og/OgImageLayout';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        <OgImageLayout
            description={siteConfig.description}
            siteTitle={`Resume » ${siteConfig.name}`}
            tag={`${siteConfig.name}'s Resume`}
            title={`Resume of ${siteConfig.name}`}
            url={buildCanonicalUrl('/resume')}
        />
    );
}
