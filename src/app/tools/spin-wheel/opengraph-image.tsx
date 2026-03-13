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
            description="Make random decisions with an interactive spinning wheel. Add custom options and spin to pick a random choice."
            siteTitle={`Spinning Wheel » ${siteConfig.name}`}
            tag="Spinning Wheel"
            title={`Spinning Wheel from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/spin-wheel')}
        />
    );
}
