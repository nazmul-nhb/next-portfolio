import { ImageResponse } from 'next/og';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import { OgImageLayout } from '../_og/OgImageLayout';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        <OgImageLayout
            description="Manage your profile and account settings."
            siteTitle={`Settings » ${siteConfig.name}`}
            tag="Settings"
            title="Account Settings"
            url={buildCanonicalUrl('/settings')}
        />
    );
}
