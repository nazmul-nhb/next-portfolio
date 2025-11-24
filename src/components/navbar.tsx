'use client';

import { Contact, Home, PenTool, Settings } from 'lucide-react';
import DocTabs from '@/components/ui/doc-tabs';

export default function Navbar() {
    return (
        <nav className="sticky top-0 flex items-center justify-center">
            <DocTabs
                tabs={[
                    { title: 'Home', path: '/', icon: Home },
                    { title: 'Contact', path: '/contact', icon: Contact },
                    { title: 'Blog', path: '/blogs', icon: PenTool },
                    { type: 'separator' },
                    { title: 'Settings', path: '/settings', icon: Settings },
                ]}
            />
        </nav>
    );
}
