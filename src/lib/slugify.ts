import { normalizeString, trimString } from 'nhb-toolbox';

/**
 * Converts a string into a URL-friendly slug.
 * - Latin stays Latin (diacritics removed).
 * - Bangla is transliterated into Latin.
 * - Other non-Latin scripts are preserved as-is (letters/digits kept).
 * - Symbols/punctuation collapse into `-`.
 * @param input - The string to be converted.
 * @returns The slugified string.
 */
export function slugify(input: string): string {
    const s = normalizeString(input);
    if (!s) return '';

    const transliterated = transliterateBanglaToLatin(s);

    return (
        trimString(transliterated)
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '') // remove Latin diacritics
            .toLowerCase()
            // keep: a-z, 0-9, ANY unicode letters/digits from other scripts, and hyphen/space
            .replace(/[^\p{L}\p{N}\s-]+/gu, ' ')
            .replace(/[\s-]+/g, '-')
            .replace(/^-+|-+$/g, '')
    );
}

/** Bangla → Latin transliteration (simplified). */
function transliterateBanglaToLatin(input: string): string {
    const BN_INDEPENDENT_VOWEL: Record<string, string> = {
        অ: 'au',
        আ: 'a',
        ই: 'i',
        ঈ: 'i',
        উ: 'u',
        ঊ: 'u',
        ঋ: 'ri',
        এ: 'e',
        ঐ: 'oi',
        ও: 'o',
        ঔ: 'ou',
    };

    const BN_CONSONANT: Record<string, string> = {
        ক: 'k',
        খ: 'kh',
        গ: 'g',
        ঘ: 'gh',
        ঙ: 'ng',
        চ: 'ch',
        ছ: 'chh',
        জ: 'j',
        ঝ: 'jh',
        ঞ: 'ny',
        ট: 't',
        ঠ: 'th',
        ড: 'd',
        ঢ: 'dh',
        ণ: 'n',
        ত: 't',
        থ: 'th',
        দ: 'd',
        ধ: 'dh',
        ন: 'n',
        প: 'p',
        ফ: 'f',
        ব: 'b',
        ভ: 'bh',
        ম: 'm',
        য: 'y',
        র: 'r',
        ল: 'l',
        শ: 'sh',
        ষ: 'sh',
        স: 's',
        হ: 'h',
        ড়: 'r',
        ঢ়: 'rh',
        য়: 'y',
        ৎ: 't',
    };

    const BN_VOWEL_SIGN: Record<string, string> = {
        'া': 'a',
        'ি': 'i',
        'ী': 'i',
        'ু': 'u',
        'ূ': 'u',
        'ৃ': 'ri',
        'ে': 'e',
        'ৈ': 'oi',
        'ো': 'o',
        'ৌ': 'ou',
    };

    const BN_MISC: Record<string, string> = {
        'ং': 'ng',
        'ঃ': 'h',
        'ঁ': 'n',
    };

    const HASANTA = '্'; // virama cancels inherent vowel

    let out = '';
    const s = input.normalize('NFC');

    for (let i = 0; i < s.length; i++) {
        const ch = s[i];

        // preserve whitespace as separator (slugify collapses later)
        if (/\s/u.test(ch)) {
            out += ' ';
            continue;
        }

        // independent vowels
        const iv = BN_INDEPENDENT_VOWEL[ch];
        if (iv) {
            out += iv;
            continue;
        }

        // misc signs
        const misc = BN_MISC[ch];
        if (misc) {
            out += misc;
            continue;
        }

        // consonants with vowel logic
        const c = BN_CONSONANT[ch];
        if (c) {
            const next = s[i + 1];

            if (next && BN_VOWEL_SIGN[next]) {
                out += c + BN_VOWEL_SIGN[next];
                i += 1;
                continue;
            }

            if (next === HASANTA) {
                out += c;
                i += 1;
                continue;
            }

            // add inherent vowel only if next char is a Bangla letter
            const nextIsBanglaLetter =
                next &&
                /[\u0980-\u09FF]/u.test(next) && // Bangla Unicode block
                !/\s/u.test(next);

            if (nextIsBanglaLetter) {
                out += `${c}o`;
            } else {
                // word-final consonant → no implicit vowel
                out += c;
            }

            continue;
        }

        // vowel signs without consonant base: ignore
        if (BN_VOWEL_SIGN[ch]) continue;

        // other chars: keep as-is (other scripts, digits, symbols, etc.)
        out += ch;
    }

    return out;
}
