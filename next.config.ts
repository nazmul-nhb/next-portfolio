import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    typedRoutes: true,
    reactCompiler: true,
    allowedDevOrigins: ['192.168.0.100'],
    images: {
        remotePatterns: [{ protocol: 'https', hostname: '**' }],
    },
    experimental: {
        typedEnv: true,
    },
};

export default nextConfig;
