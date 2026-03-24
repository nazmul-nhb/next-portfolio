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
            description="Create and participate in crowd polls with anonymous voting support."
            siteTitle={`Crowd Polls » ${siteConfig.name}`}
            tag="Crowd Polls"
            title={`Crowd Polls from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/crowd-polls')}
        />
    );
}
