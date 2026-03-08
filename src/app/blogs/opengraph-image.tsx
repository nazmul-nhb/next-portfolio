import { ImageResponse } from 'next/og';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import { OgImageLayout } from '../_og/OgImageLayout';

export const runtime = 'edge';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        <OgImageLayout
            description="Read articles about programming, web development, technology, literature and more."
            siteTitle={`Blogs » ${siteConfig.name}`}
            tag="Blogs"
            title={`Read Blogs`}
            url={buildCanonicalUrl('/blogs')}
        />
    );
}
