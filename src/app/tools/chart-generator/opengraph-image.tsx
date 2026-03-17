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
            description="Create beautiful, interactive charts and graphs from JSON data. Support for bar, line, area, pie, scatter, and more."
            siteTitle={`Chart Generator » ${siteConfig.name}`}
            tag="Chart Generator"
            title={`Chart Generator from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/chart-generator')}
        />
    );
}
