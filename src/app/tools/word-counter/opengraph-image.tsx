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
            description="Analyze your text with detailed word, character, and readability metrics."
            siteTitle={`Word Counter » ${siteConfig.name}`}
            tag="Word Counter"
            title={`Word Counter from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/word-counter')}
        />
    );
}
