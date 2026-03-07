import {
    Anek_Bangla,
    Cascadia_Code,
    Geist,
    Geist_Mono,
    Inter,
    Playfair_Display,
    Poppins,
    Roboto_Mono,
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

export const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
});

export const poppins = Poppins({
    variable: '--font-poppins',
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

export const playfairDisplay = Playfair_Display({
    variable: '--font-playfair-display',
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

export const robotoMono = Roboto_Mono({
    variable: '--font-roboto-mono',
    subsets: ['latin'],
});
