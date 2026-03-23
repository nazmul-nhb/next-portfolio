'use client';

import { base64ToBytes } from 'nhb-toolbox/hash';

/**
 * Guess mime type
 */
function getMimeType(path: string): string {
    if (path.endsWith('.png')) return 'image/png';
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
    if (path.endsWith('.gif')) return 'image/gif';
    if (path.endsWith('.css')) return 'text/css';
    if (path.endsWith('.js')) return 'text/javascript';
    if (path.endsWith('.mp3')) return 'audio/mpeg';
    if (path.endsWith('.spx') || path.endsWith('.ogg')) return 'audio/ogg';
    return 'application/octet-stream';
}

/**
 * Convert base64 → ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const bytes = base64ToBytes(base64);
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    return copy.buffer;
}

/**
 * Resolve MDict HTML resources in browser (CSS scoped)
 */
export function resolveMDictHtml(html: string, resources: Record<string, string>): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // create a unique wrapper class for this HTML
    const wrapperClass = `mdict-${Math.random().toString(36).slice(2, 7)}`;
    const wrapper = document.createElement('div');
    wrapper.className = wrapperClass;
    wrapper.innerHTML = doc.body.innerHTML;

    const elements = wrapper.querySelectorAll('[src], [href]');

    for (const el of elements) {
        const attr = el.hasAttribute('src') ? 'src' : 'href';
        const value = el.getAttribute(attr);
        if (!value) continue;

        const base64 = resources[value];
        if (!base64) continue;

        const mime = getMimeType(value);

        // CSS special handling: scope it to wrapper
        if (mime === 'text/css') {
            const cssText = new TextDecoder().decode(
                new Uint8Array(base64ToArrayBuffer(base64))
            );

            // simple prefixing: prepend wrapper class to each selector
            const scopedCss = cssText.replace(/(^|})([^@}{]+)/g, (match, g1, sel) => {
                if (sel.trim().startsWith('@')) return match; // keep @ rules
                return `${g1} .${wrapperClass} ${sel}`;
            });

            const style = document.createElement('style');
            style.textContent = scopedCss;
            wrapper.prepend(style);

            el.remove(); // remove original <link>
            continue;
        }

        // handle images / scripts / audio
        const buffer = base64ToArrayBuffer(base64);
        const blob = new Blob([buffer], { type: mime });
        const url = URL.createObjectURL(blob);
        el.setAttribute(attr, url);
    }

    return wrapper.outerHTML;
}
