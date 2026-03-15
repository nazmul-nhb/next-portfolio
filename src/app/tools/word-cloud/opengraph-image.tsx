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
            description="Generate interactive word clouds from text with customizable fonts, colors, and layouts. Export as PNG or JPEG."
            siteTitle={`Word Cloud Generator » ${siteConfig.name}`}
            tag="Word Cloud Generator"
            title={`Word Cloud Generator from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/word-cloud')}
        />
    );
}
