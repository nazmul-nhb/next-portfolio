import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    typedRoutes: true,
    reactCompiler: true,
    allowedDevOrigins: ['192.168.0.100'],
    images: {
        qualities: [75, 100],
        remotePatterns: [{ protocol: 'https', hostname: '**' }],
    },
    experimental: {
        typedEnv: true,
    },
    turbopack: {
        root: import.meta.dirname,
    },
};

export default nextConfig;
