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
	// Le vecchie liste confluiscono nel catalogo unico; le pagine sostituite
	// dal revamp portano alle nuove schermate.
	async redirects() {
		return [
			{ source: '/trending', destination: '/catalogo/trending', permanent: false },
			{ source: '/movies', destination: '/catalogo/trending?type=movie', permanent: false },
			{ source: '/discovery', destination: '/catalogo/trending?type=movie', permanent: false },
			{ source: '/tv', destination: '/catalogo/trending?type=tv', permanent: false },
			{ source: '/top-rated', destination: '/catalogo/top-rated', permanent: false },
			{ source: '/now-playing', destination: '/catalogo/now-playing', permanent: false },
			{ source: '/new-releases', destination: '/catalogo/upcoming', permanent: false },
			{ source: '/catalogo', destination: '/catalogo/trending', permanent: false },
			{ source: '/tv/following', destination: '/tracker', permanent: false },
			{ source: '/profile/watchlist', destination: '/profile?tab=watchlist', permanent: false },
			{ source: '/profile/favorites', destination: '/profile?tab=preferiti', permanent: false },
			{ source: '/profile/lists', destination: '/profile?tab=liste', permanent: false },
		];
	},
};

export default nextConfig;
