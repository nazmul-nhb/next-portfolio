import type { Metadata } from 'next';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import EncryptMessage from './_components/EncryptMessage';

const description = 'Encrypt/decrypt text using a passphrase.';

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
    },
};

export default function EncryptMessagePage() {
    return <EncryptMessage />;
}
