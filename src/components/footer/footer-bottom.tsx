'use client';

import { useMount } from 'nhb-hooks';
import { siteConfig } from '@/configs/site';
import { getCurrentYear } from '@/lib/utils';

export default function FooterBottom() {
    return useMount(
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border/40 pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">
                &copy; {getCurrentYear()} {siteConfig.name}. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">Built with Next.js & TypeScript</p>
        </div>
    );
}
