export { auth as middleware } from '@/lib/auth';

export const config = {
    matcher: ['/settings/:path*', '/messages/:path*', '/blogs/new', '/blogs/edit/:path*'],
};
