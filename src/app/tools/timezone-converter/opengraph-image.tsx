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
            description="Compare current time across multiple timezones with live updates. Supports IANA identifiers, abbreviations, and custom UTC offsets."
            siteTitle={`Timezone Converter » ${siteConfig.name}`}
            tag="Timezone Converter"
            title={`Timezone Converter from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/timezone-converter')}
        />
    );
}
