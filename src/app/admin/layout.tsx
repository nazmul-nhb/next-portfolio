import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/nav/admin-sidebar';
import { auth } from '@/lib/auth';
import type { ChildrenProp } from '@/types';

export const metadata: Metadata = {
    title: {
        default: 'Admin Dashboard',
        template: '%s » Admin Dashboard',
    },
    description: 'Admin dashboard for managing users, blogs and portfolio content',
};

export default async function AdminLayout({ children }: ChildrenProp) {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
        redirect('/auth/login?redirectTo=/admin');
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden">
                <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
            </main>
        </div>
    );
}
