import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MDD, MDX } from 'js-mdict';

/**
 * Normalize possible MDD paths
 */
function normalizePath(path: string): string[] {
    const clean = path.replace(/^\.?\//, '');

    return [clean, clean.replace(/\//g, '\\'), `\\${clean}`, `\\${clean.replace(/\//g, '\\')}`];
}

/**
 * Server-side dictionary (MDX + MDD + FS)
 */
export class MDictServer {
    private mdx: MDX;
    private mdd?: MDD;
    private basePath: string;

    constructor(mdx: MDX, mdd: MDD | undefined, basePath: string) {
        this.mdx = mdx;
        this.mdd = mdd;
        this.basePath = basePath;
    }

    /**
     * Lookup word and return html + resource map (base64)
     */
    lookup(word: string): {
        html: string;
        resources: Record<string, string>;
    } | null {
        const res = this.mdx.lookup(word);
        if (!res?.definition) return null;

        const html = res.definition;
        const resources: Record<string, string> = {};

        const matches = html.match(/(?:src|href)=["']([^"']+)["']/g) ?? [];

        for (const match of matches) {
            const path = match.split(/["']/)[1];
            if (!path || resources[path]) continue;

            const decodedPath = decodeURIComponent(path);

            // 1️⃣ Try MDD
            if (this.mdd) {
                const candidates = normalizePath(decodedPath);

                for (const key of candidates) {
                    const found = this.mdd.locate(key);

                    if (found?.definition) {
                        resources[path] = found.definition;
                        break;
                    }
                }

                if (resources[path]) continue;
            }

            // 2️⃣ Try local filesystem
            const fullPath = join(this.basePath, decodedPath);

            if (existsSync(fullPath)) {
                const file = readFileSync(fullPath);
                const base64 = file.toString('base64');

                resources[path] = base64;
            }
        }

        return { html, resources };
    }
}
