import type { Metadata } from 'next';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import QRCodeGenerator from './_components/QRCodeGenerator';

const description =
    'Generate QR codes from text or URLs with customizable size, colors, and error correction levels. Download as PNG or SVG.';

export const metadata: Metadata = {
    title: 'QR Code Generator',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'qr code generator',
        'qr code',
        'qr',
        'barcode generator',
        'qrcode',
        'generate qr code',
        'qr code maker',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/qr-code-generator') },
    openGraph: {
        title: `QR Code Generator from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/qr-code-generator'),
        siteName: siteConfig.name,
    },
};

export default function QRCodeGeneratorPage() {
    return <QRCodeGenerator />;
}
