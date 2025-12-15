import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'image.tmdb.org',
			},
			{
				protocol: 'https',
				hostname: 'www.gravatar.com',
			},
			{
				protocol: 'https',
				hostname: 'secure.gravatar.com',
			},
		],
	},
};

export default nextConfig;
