import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdminPath } from '@/lib/utils';

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const session = await auth();

    const hasUser = !!session?.user;
    // `active` is false when an admin has deleted or deactivated the account.
    // The jwt callback sets this flag on every periodic DB re-verification.
    const isActive = session?.user?.active !== false;

    const authRedirect = new URL(`/auth/login?redirectTo=${pathname}`, req.url);

    const protectedPaths = ['/settings', '/messages', '/blogs/new', '/blogs/edit'] as const;

    // Force-sign-out any user whose account has been deleted or deactivated
    if (hasUser && !isActive) {
        return NextResponse.redirect(new URL('/auth/force-signout', req.url));
    }

    // Admin routes - require admin role
    if (isAdminPath(pathname)) {
        if (!hasUser) {
            return NextResponse.redirect(authRedirect);
        }

        if (session.user.role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url));
        }

        return NextResponse.next();
    }

    // Protected user routes - require authentication
    if (protectedPaths.some((path) => pathname.startsWith(path))) {
        if (!hasUser) {
            return NextResponse.redirect(authRedirect);
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
