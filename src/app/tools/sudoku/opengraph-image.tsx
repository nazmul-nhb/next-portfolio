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
            description="Generate and solve Sudoku puzzles with different difficulty levels. Play with keyboard navigation and real-time conflict detection."
            siteTitle={`Sudoku Game » ${siteConfig.name}`}
            tag="Sudoku"
            title={`Sudoku Game from ${siteConfig.name}`}
            url={buildCanonicalUrl('/tools/sudoku')}
        />
    );
}
