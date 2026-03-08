import { ImageResponse } from 'next/og';
import { siteConfig } from '@/configs/site';
import { OgImageLayout } from './_og/OgImageLayout';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        <OgImageLayout
            description={siteConfig.description}
            siteTitle={siteConfig.name}
            tag="Full-Stack Developer"
            title={`Hi, I'm ${siteConfig.name}`}
            url={siteConfig.baseUrl}
        />,
        size
    );
}
