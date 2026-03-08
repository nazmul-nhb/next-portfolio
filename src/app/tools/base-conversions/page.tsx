import type { Metadata } from 'next';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import BaseConverter from './_components/BaseConverter';

const description =
    'Convert UTF-8 text, hex, binary, and Base64 using UTF-8-safe byte-level transformations powered by TextCodec.';

export const metadata: Metadata = {
    title: 'Base Conversions',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'base conversion',
        'binary converter',
        'hex converter',
        'base64 converter',
        'utf8 converter',
        'textcodec',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/base-conversions') },
    openGraph: {
        title: `Base Conversions from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/base-conversions'),
        siteName: siteConfig.name,
    },
};

export default function BaseConversionPage() {
    return <BaseConverter />;
}
