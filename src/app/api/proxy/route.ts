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
 * Some third-party pages include PWA bootstrap files (e.g. `registerSW.js`).
 * When proxied into our origin, those scripts can attempt cross-origin SW
 * registration and throw SecurityError in the console.
 */
const REGISTER_SW_SCRIPT_RE =
    /<script\b[^>]*\bsrc=(['"])[^'"]*registerSW(?:\.[^'"]+)?\.js[^'"]*\1[^>]*>\s*<\/script>/gi;
const REGISTER_SW_LINK_RE =
    /<link\b[^>]*\bhref=(['"])[^'"]*registerSW(?:\.[^'"]+)?\.js[^'"]*\1[^>]*>/gi;

/**
 * Align iframe location path with the target URL path before SPA boot.
 * Without this, frameworks may see `/api/proxy` and render their 404 page.
 */
function buildHistoryAlignScript(targetUrl: string) {
    const safe = JSON.stringify(targetUrl);

    return /*html*/ `
<script data-mini-browser-history>
    (() => {
        try {
            const target = new URL(${safe});
            const nextPath = target.pathname.concat(target.search, target.hash) || '/';

            const currentPath = window.location.pathname.concat(
                window.location.search,
                window.location.hash
            );

            // Use an absolute same-origin URL. With <base href="https://..."> present,
            // a relative "/" would resolve to the external origin and throw SecurityError.
            if (currentPath !== nextPath) {
                const sameOriginUrl = window.location.origin.concat(
                    nextPath.startsWith('/') ? nextPath : '/'.concat(nextPath)
                );
                history.replaceState(null, '', sameOriginUrl);
            }
        } catch {
            // Do nothing...
        }
    })();
</script>`;
}

/**
 * Remove top-level CSP meta from proxied pages so our injected script can run.
 * Some pages define restrictive `script-src` that blocks inline bootstrap fixes.
 */
const CSP_META_RE = /<meta\b[^>]*http-equiv=(['"])Content-Security-Policy\1[^>]*>/gi;

/**
 * Remove top-level frame-ancestors CSP meta from proxied pages.
 * It can block iframe embedding even though we're proxying HTML.
 */
const FRAME_ANCESTORS_META_RE =
    /<meta\b[^>]*content=(['"])[^'"]*frame-ancestors[^'"]*\1[^>]*>/gi;

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

        // Remove known SW bootstrap assets from proxied pages to avoid
        // cross-origin service-worker registration errors in the iframe.
        html = html.replaceAll(REGISTER_SW_SCRIPT_RE, '');
        html = html.replaceAll(REGISTER_SW_LINK_RE, '');
        html = html.replaceAll(CSP_META_RE, '');
        html = html.replaceAll(FRAME_ANCESTORS_META_RE, '');

        // Inject <base> so relative URLs (CSS, JS, images) still resolve
        // against the original domain. Insert right after <head> if present.
        const baseTag = `<base href="${url}">`;
        const historyAlignScript = buildHistoryAlignScript(url);
        const injectedHead = `${baseTag}${SCROLLBAR_CSS}${historyAlignScript}`;

        if (/<head[^>]*>/i.test(html)) {
            html = html.replace(/(<head[^>]*>)/i, `$1${injectedHead}`);
        } else {
            // Fallback: prepend to the HTML
            html = `${injectedHead}${html}`;
        }

        return new NextResponse(html, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                // Prevent the proxied page from breaking out of the iframe
                'X-Frame-Options': 'SAMEORIGIN',
                // Avoid stale injected scripts while iterating on proxy behavior.
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch the URL' }, { status: 502 });
    }
}
