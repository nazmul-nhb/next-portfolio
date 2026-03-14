import type { Metadata } from 'next';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';
import SudokuGame from './_components/SudokuGame';

const description =
    'Generate and solve Sudoku puzzles with different difficulty levels. Play with keyboard navigation and real-time conflict detection.';

export const metadata: Metadata = {
    title: 'Sudoku',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'sudoku',
        'sudoku puzzle',
        'sudoku solver',
        'sudoku game',
        'logic puzzle',
        'brain game',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/sudoku') },
    openGraph: {
        title: `Sudoku from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/sudoku'),
        siteName: siteConfig.name,
    },
};

export default function SudokuPage() {
    return (
        <div className="space-y-8">
            <TitleWithShare description={description} route="/tools/sudoku" title="Sudoku" />
            <SudokuGame />
        </div>
    );
}
