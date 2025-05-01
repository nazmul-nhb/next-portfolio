import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	logging: {
		fetches: {
			hmrRefreshes: true,
		},
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
		],
	},
};

export default nextConfig;
