import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    typedRoutes: true,
    reactCompiler: true,
    allowedDevOrigins: ['192.168.0.100'],
};

export default nextConfig;
