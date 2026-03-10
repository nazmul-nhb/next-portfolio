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
            description="Calculate the difference between two dates in any time unit (years, months, weeks, days, hours, minutes, seconds, or milliseconds)."
            siteTitle={`Time Difference Calculator » ${siteConfig.name}`}
            tag="Time Difference Calculator"
            title={`Time Difference Calculator from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/time-difference')}
        />
    );
}
