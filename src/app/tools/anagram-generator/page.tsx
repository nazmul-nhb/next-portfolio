import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import { parseJSON } from 'nhb-toolbox';
import AnagramGenerator from '@/app/tools/anagram-generator/_components/AnagramGenerator';
import { siteConfig } from '@/configs/site';
import { buildCanonicalUrl } from '@/lib/utils';

async function loadDictionary() {
    const filePath = join(process.cwd(), 'src', 'data', 'english-words.json');
    const content = await fs.readFile(filePath, 'utf8');
    return parseJSON<{ words: string[] }>(content, false);
}

const description =
    'Generate unique anagrams of any word. Choose from with/without built-in dictionary, or upload a custom word list.';

export const metadata: Metadata = {
    title: 'Anagram Generator',
    description,
    keywords: [
        ...siteConfig.keywords,
        ...Object.values(siteConfig.links),
        'anagram generator',
        'anagrams',
        'word anagrams',
        'anagram solver',
        'word permutations',
        'unique anagrams',
    ],
    alternates: { canonical: buildCanonicalUrl('/tools/anagram-generator') },
    openGraph: {
        title: `Anagram Generator from ${siteConfig.name}`,
        description,
        url: buildCanonicalUrl('/tools/anagram-generator'),
        siteName: siteConfig.name,
    },
};

export default async function Page() {
    const { words } = await loadDictionary();

    return <AnagramGenerator dictionary={words} />;
}
