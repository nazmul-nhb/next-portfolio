import { ImageResponse } from 'next/og';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import { OgImageLayout } from '../../_og/OgImageLayout';

export const runtime = 'edge';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        <OgImageLayout
            description="Generate and decode UUIDs across all RFC 4122 versions (v1, v3-v8)."
            siteTitle={`UUID Generator & Decoder » ${siteConfig.name}`}
            tag={`UUID Generator & Decoder`}
            title={`UUID Generator & Decoder from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/uuid')}
        />
    );
}
