import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'CineScope - Scopri film e serie TV',
		short_name: 'CineScope',
		description: 'Trova subito cosa guardare, segui le tue serie e scopri dove vedere film e serie TV.',
		start_url: '/',
		display: 'standalone',
		background_color: '#0e0e10',
		theme_color: '#0e0e10',
		icons: [
			{
				src: '/icon',
				sizes: '32x32',
				type: 'image/png',
			},
			{
				src: '/icon-512',
				sizes: '512x512',
				type: 'image/png',
			},
			{
				src: '/apple-icon',
				sizes: '180x180',
				type: 'image/png',
			},
		],
	};
}
