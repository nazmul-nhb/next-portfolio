import { ImageResponse } from 'next/og';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import { OgImageLayout } from '../../_og/OgImageLayout';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        <OgImageLayout
            description="Create polished photo cards with layered images, custom typography, live preview, and more."
            siteTitle={`Photo Card Generator » ${siteConfig.name}`}
            tag={`Photo Card Generator`}
            title={`Photo Card Generator from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/photo-card')}
        />
    );
}
