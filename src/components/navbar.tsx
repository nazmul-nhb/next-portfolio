'use client';

import DocTabs from '@/components/ui/doc-tabs';
import { siteConfig } from '@/configs/site';

export default function Navbar() {
    return (
        <nav className="sticky top-0 flex items-center justify-center">
            <DocTabs tabs={siteConfig.navItems} />
        </nav>
    );
}
