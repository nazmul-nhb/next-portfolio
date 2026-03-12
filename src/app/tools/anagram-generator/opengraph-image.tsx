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
            description="Generate unique anagrams of any word using multiple filtering options."
            siteTitle={`Anagram Generator » ${siteConfig.name}`}
            tag="Anagram Generator"
            title={`Anagram Generator from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/anagram-generator')}
        />
    );
}
