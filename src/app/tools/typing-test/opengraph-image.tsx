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
            description="Test your typing speed and accuracy with real-time metrics, WPM tracking, and multiple duration modes."
            siteTitle={`Typing Speed Test » ${siteConfig.name}`}
            tag="Typing Speed Test"
            title={`Typing Speed Test from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/typing-test')}
        />
    );
}
