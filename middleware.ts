import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(req: NextRequest) {
    const session = await auth();
    const { pathname } = req.nextUrl;

    // Admin routes - require admin role
    if (pathname.startsWith('/admin')) {
        if (!session?.user) {
            return NextResponse.redirect(
                new URL(`/auth/login?callbackUrl=${pathname}`, req.url)
            );
        }

        if (session.user.role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url));
        }

        return NextResponse.next();
    }

    // Protected user routes - require authentication
    if (
        pathname.startsWith('/settings') ||
        pathname.startsWith('/messages') ||
        pathname === '/blogs/new' ||
        pathname.startsWith('/blogs/edit')
    ) {
        if (!session?.user) {
            return NextResponse.redirect(
                new URL(`/auth/login?callbackUrl=${pathname}`, req.url)
            );
        }

        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/settings/:path*',
        '/messages/:path*',
        '/blogs/new',
        '/blogs/edit/:path*',
    ],
};
