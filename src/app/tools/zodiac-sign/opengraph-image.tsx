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
            description="Find a matching zodiac sign from a birth date using western or vedic presets, with date ranges and traditional sign descriptions."
            siteTitle={`Zodiac Sign Finder » ${siteConfig.name}`}
            tag={`Zodiac Sign Finder`}
            title={`Zodiac Sign Finder from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/zodiac-sign')}
        />
    );
}
