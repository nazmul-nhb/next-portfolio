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
            description="Login to your account to access personalized features."
            siteTitle={`Login » ${siteConfig.name}`}
            title={`Login to ${siteConfig.name}`}
            url={buildCanonicalUrl('/auth/login')}
        />
    );
}
