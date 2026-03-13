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
            description="Generate QR codes from text or URLs with customizable size, colors, and error correction levels."
            siteTitle={`QR Code Generator » ${siteConfig.name}`}
            tag="QR Code Generator"
            title={`QR Code Generator from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/qr-code-generator')}
        />
    );
}
