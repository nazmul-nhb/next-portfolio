import {
    Anek_Bangla,
    Cascadia_Code,
    Geist,
    Geist_Mono,
    Source_Sans_3,
    Tiro_Bangla,
} from 'next/font/google';

export const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

export const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const tiroBangla = Tiro_Bangla({
    variable: '--font-tiro-bangla',
    subsets: ['bengali'],
    weight: ['400'],
});

export const anekBangla = Anek_Bangla({
    variable: '--font-anek-bangla',
    subsets: ['bengali'],
    weight: 'variable',
});

export const sourceSans = Source_Sans_3({
    variable: '--font-source-sans',
    subsets: ['latin'],
    weight: 'variable',
});

export const cascadiaCode = Cascadia_Code({
    variable: '--font-cascadia-code',
    subsets: [
        'arabic',
        'braille',
        'cyrillic',
        'cyrillic-ext',
        'greek',
        'hebrew',
        'latin',
        'latin-ext',
        'symbols2',
        'vietnamese',
    ],
    weight: 'variable',
    fallback: ['monospace'],
});
