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
            description="Write a new blog post about programming, web development, technology, literature and more."
            siteTitle={`Write a New Blog Post » ${siteConfig.name}`}
            tag="Write a New Blog Post"
            title={`Write a New Blog Post`}
            url={buildCanonicalUrl('/blogs/new')}
        />
    );
}
