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
            description="Create, edit, and manage multiple professional resumes with live preview, customizable fonts, and more."
            siteTitle={`Resume Builder » ${siteConfig.name}`}
            tag="Resume Builder"
            title={`Resume Builder from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/resume-builder')}
        />
    );
}
