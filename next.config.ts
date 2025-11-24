import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    typedRoutes: true,
    reactCompiler: true,
    allowedDevOrigins: ['192.168.0.100'],
    experimental: {
        typedEnv: true,
        // typedRoutes: true,
    },
};

export default nextConfig;
