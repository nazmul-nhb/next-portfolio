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
            description=""
            siteTitle={`MDict Viewer » ${siteConfig.name}`}
            tag="MDict Viewer"
            title={`MDict Viewer from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/mdict-viewer')}
        />
    );
}
