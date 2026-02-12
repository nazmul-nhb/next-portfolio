import {
    Briefcase,
    FolderKanban,
    GraduationCap,
    LayoutDashboard,
    Lightbulb,
    MessageCircle,
    MessageSquareQuote,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
        redirect('/auth/login?callbackUrl=/admin');
    }

    const menuItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
        { href: '/admin/skills', label: 'Skills', icon: Lightbulb },
        { href: '/admin/experience', label: 'Experience', icon: Briefcase },
        { href: '/admin/education', label: 'Education', icon: GraduationCap },
        { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
        { href: '/admin/messages', label: 'Messages', icon: MessageCircle },
    ];

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card">
                <div className="sticky top-0 flex h-screen flex-col">
                    <div className="border-b border-border p-6">
                        <h2 className="text-xl font-bold">Admin Panel</h2>
                        <p className="text-sm text-muted-foreground">Manage your portfolio</p>
                    </div>

                    <nav className="flex-1 space-y-1 p-4">
                        {menuItems.map((item) => (
                            <Link
                                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                href={item.href as '/'}
                                key={item.href}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="border-t border-border p-4">
                        <Link
                            className="block rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                            href="/"
                        >
                            ← Back to Site
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                <div className="mx-auto max-w-7xl p-8">{children}</div>
            </main>
        </div>
    );
}
