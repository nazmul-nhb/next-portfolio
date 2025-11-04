'use client';

import DocTabs from '@/components/ui/doc-tabs';
import { Contact, Home, PenTool, Settings } from 'lucide-react';

export default function Navbar() {
	return (
		<nav className="sticky top-0 flex items-center justify-center">
			<DocTabs
				tabs={[
					{ title: 'Home', icon: Home },
					{ title: 'Contact', icon: Contact },
					{ title: 'Blog', icon: PenTool },
					{ type: 'separator' },
					{ title: 'Settings', icon: Settings },
				]}
			/>
		</nav>
	);
}
