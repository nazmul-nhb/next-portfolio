import { ImageResponse } from 'next/og';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import { OgImageLayout } from '../../_og/OgImageLayout';

export const runtime = 'edge';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        <OgImageLayout
            description="Track income, expenses, loans, repayments, and cash in hand."
            siteTitle={`Expense Manager » ${siteConfig.name}`}
            tag={`Expense Manager`}
            title={`Expense Manager from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/expenses')}
        />
    );
}
