import { ImageResponse } from 'next/og';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import { OgImageLayout } from '../_og/OgImageLayout';

export const runtime = 'edge';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        <OgImageLayout
            description={`Get in touch with ${siteConfig.name}. I would love to hear from you!`}
            siteTitle={`Contact » ${siteConfig.name}`}
            tag={`Get in touch with ${siteConfig.name}`}
            title={`Contact ${siteConfig.name}`}
            url={buildCanonicalUrl('/contact')}
        />
    );
}
