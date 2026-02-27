import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    typedRoutes: true,
    reactCompiler: true,
    allowedDevOrigins: ['192.168.0.100', '192.168.0.200'],
    images: {
        qualities: [75, 100],
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
        ],
    },
    experimental: {
        typedEnv: true,
    },
    turbopack: {
        root: import.meta.dirname,
    },
};

export default nextConfig;
