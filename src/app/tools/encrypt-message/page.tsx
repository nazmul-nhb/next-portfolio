import type { Metadata } from 'next';
import EncryptMessage from '@/app/tools/encrypt-message/_components/EncryptMessage';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl, buildOpenGraphImages } from '@/lib/utils';

const description = 'Encrypt/decrypt text using custom passphrase.';

export const metadata: Metadata = {
    title: 'Encrypt/Decrypt Message',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'encrypt',
        'decrypt',
        'base64 converter',
        'utf8 converter',
        'encrypt/decrypt message',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/encrypt-message') },
    openGraph: {
        title: `Encrypt/Decrypt Message from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/encrypt-message'),
        siteName: siteConfig.name,
        images: buildOpenGraphImages(siteConfig.logoSvg, siteConfig.favicon),
    },
    twitter: {
        card: 'summary_large_image',
        title: `Encrypt/Decrypt Message from ${siteConfig.name}`,
        description,
        images: buildOpenGraphImages(siteConfig.logoSvg, siteConfig.favicon),
        creator: '@nhb42',
    },
};

export default function EncryptMessagePage() {
    return <EncryptMessage />;
}
