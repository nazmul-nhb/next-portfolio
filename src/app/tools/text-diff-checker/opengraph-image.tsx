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
            description="Compare two texts and view detailed differences with line-by-line highlighting."
            siteTitle={`Text Diff Checker » ${siteConfig.name}`}
            tag="Text Diff Checker"
            title={`Text Diff Checker from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/text-diff-checker')}
        />
    );
}
