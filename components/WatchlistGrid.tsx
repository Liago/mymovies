'use client';

import { useState } from 'react';
import { actionGetWatchlist } from '@/app/actions';
import MovieCard from './MovieCard';

interface WatchlistItem {
	id: number;
	title: string;
	poster: string | null;
	type: 'movie' | 'tv';
}

interface WatchlistGridProps {
	initialItems: WatchlistItem[];
	mediaType: 'movies' | 'tv';
	totalPages: number;
}

export default function WatchlistGrid({ initialItems, mediaType, totalPages }: WatchlistGridProps) {
	const [items, setItems] = useState<WatchlistItem[]>(initialItems);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(totalPages > 1);

	const loadMore = async () => {
		setLoading(true);
		const nextPage = page + 1;

		const { results, total_pages } = await actionGetWatchlist(mediaType, nextPage);
		setItems(prev => [...prev, ...results]);
		setPage(nextPage);
		setHasMore(nextPage < total_pages);
		setLoading(false);
	};

	return (
		<>
			<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
				{items.map((item) => (
					<MovieCard key={item.id} {...item} />
				))}
			</div>

			{hasMore && (
				<div className="flex justify-center mt-12">
					<button
						onClick={loadMore}
						disabled={loading}
						className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Loading...' : 'Load More'}
					</button>
				</div>
			)}
		</>
	);
}
