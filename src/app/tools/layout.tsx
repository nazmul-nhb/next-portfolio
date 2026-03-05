import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ToolsSidebar } from '@/components/nav/tools-sidebar';
import { auth } from '@/lib/auth';
import type { ChildrenProp } from '@/types';

export const metadata: Metadata = {
    title: {
        default: 'Tools',
        template: '%s » Tools',
    },
    description: 'Personal tool suite for authenticated users.',
};

export default async function ToolsLayout({ children }: ChildrenProp) {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth/login?redirectTo=/tools');
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            <ToolsSidebar />
            <main className="flex-1 overflow-x-hidden">
                <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
            </main>
        </div>
    );
}
