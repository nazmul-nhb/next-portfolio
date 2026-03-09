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
            description="Search for any npm package and view comprehensive details including downloads and maintainers."
            siteTitle={`NPM Package Details » ${siteConfig.name}`}
            tag="NPM Package"
            title={`NPM Package Details from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/npm-package')}
        />
    );
}
