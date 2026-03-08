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
            description="Encrypt/decrypt text using a passphrase."
            siteTitle={`Encrypt/Decrypt Message » ${siteConfig.name}`}
            tag={`Encrypt/Decrypt Message`}
            title={`Encrypt/Decrypt Message from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/encrypt-message')}
        />
    );
}
