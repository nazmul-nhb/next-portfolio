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
            description="Convert UTF-8 text, hex, binary, and Base64 using UTF-8-safe byte-level transformations powered by TextCodec."
            siteTitle={`Base Conversions » ${siteConfig.name}`}
            tag={`Base Conversions`}
            title={`Base Conversions from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/base-conversions')}
        />
    );
}
