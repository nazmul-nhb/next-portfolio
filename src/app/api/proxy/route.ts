import { type NextRequest, NextResponse } from 'next/server';

/** Scrollbar CSS injected into proxied pages. */
const SCROLLBAR_CSS = /*html*/ `
<style data-mini-browser>
    html{--sb-track:#8da7ff40;--sb-thumb:#9eb4fbbd;--sb-size:6px}
    html::-webkit-scrollbar{width:var(--sb-size)}
    html::-webkit-scrollbar-track{background:var(--sb-track)}
    html::-webkit-scrollbar-thumb{background:var(--sb-thumb);border-radius:2px;border:0.5px solid #9eb4fb}
    @supports not selector(::-webkit-scrollbar){html{scrollbar-color:var(--sb-thumb) var(--sb-track)}}
</style>`;

/**
 * Proxy route that fetches external HTML, injects a `<base>` tag
 * (so relative resources resolve against the original domain) and
 * appends custom scrollbar CSS. The iframe loads this same-origin
 * URL so the styles take effect.
 */
export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing ?url= parameter' }, { status: 400 });
    }

    try {
        new URL(url); // validate
    } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            redirect: 'follow',
        });

        const contentType = res.headers.get('content-type') ?? '';

        // Only proxy HTML pages
        if (!contentType.includes('text/html')) {
            return NextResponse.redirect(url);
        }

        let html = await res.text();

        // Inject <base> so relative URLs (CSS, JS, images) still resolve
        // against the original domain. Insert right after <head> if present.
        const baseTag = `<base href="${url}">`;

        if (/<head[^>]*>/i.test(html)) {
            html = html.replace(/(<head[^>]*>)/i, `$1${baseTag}${SCROLLBAR_CSS}`);
        } else {
            // Fallback: prepend to the HTML
            html = `${baseTag}${SCROLLBAR_CSS}${html}`;
        }

        return new NextResponse(html, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                // Prevent the proxied page from breaking out of the iframe
                'X-Frame-Options': 'SAMEORIGIN',
                // Don't cache proxy responses for long
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
            },
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch the URL' }, { status: 502 });
    }
}
