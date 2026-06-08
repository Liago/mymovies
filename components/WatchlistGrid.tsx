'use client';

import { useMemo, useState } from 'react';
import { actionGetWatchlist, type WatchlistProviderRef } from '@/app/actions';
import MovieCard from './MovieCard';
import WatchlistProviderFilter from './WatchlistProviderFilter';
import { useLanguage } from '@/context/LanguageContext';

interface WatchlistItem {
	id: number;
	title: string;
	poster: string | null;
	type: 'movie' | 'tv';
	providers?: WatchlistProviderRef[];
}

interface WatchlistGridProps {
	initialItems: WatchlistItem[];
	mediaType: 'movies' | 'tv';
	totalPages: number;
}

export default function WatchlistGrid({ initialItems, mediaType, totalPages }: WatchlistGridProps) {
	const { t } = useLanguage();
	const [items, setItems] = useState<WatchlistItem[]>(initialItems);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(totalPages > 1);
	const [selectedProviders, setSelectedProviders] = useState<Set<number>>(new Set());

	const loadMore = async () => {
		setLoading(true);
		const nextPage = page + 1;

		const { results, total_pages } = await actionGetWatchlist(mediaType, nextPage);
		setItems(prev => [...prev, ...results]);
		setPage(nextPage);
		setHasMore(nextPage < total_pages);
		setLoading(false);
	};

	const { uniqueProviders, providerCounts } = useMemo(() => {
		const map = new Map<number, WatchlistProviderRef>();
		const counts = new Map<number, number>();
		for (const item of items) {
			if (!item.providers) continue;
			for (const p of item.providers) {
				if (!map.has(p.id)) map.set(p.id, p);
				counts.set(p.id, (counts.get(p.id) ?? 0) + 1);
			}
		}
		const list = Array.from(map.values()).sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
		return { uniqueProviders: list, providerCounts: counts };
	}, [items]);

	const visibleItems = useMemo(() => {
		if (selectedProviders.size === 0) return items;
		return items.filter((item) =>
			item.providers?.some((p) => selectedProviders.has(p.id))
		);
	}, [items, selectedProviders]);

	const toggleProvider = (id: number) => {
		setSelectedProviders((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	return (
		<>
			{uniqueProviders.length > 0 && (
				<div className="mb-8">
					<WatchlistProviderFilter
						providers={uniqueProviders}
						selected={selectedProviders}
						onToggle={toggleProvider}
						onClear={() => setSelectedProviders(new Set())}
						counts={providerCounts}
					/>
				</div>
			)}

			{visibleItems.length === 0 ? (
				<div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 border-dashed">
					<p className="text-gray-400">{t('watchlist.filter_empty')}</p>
				</div>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
					{visibleItems.map((item) => (
						<MovieCard key={item.id} {...item} />
					))}
				</div>
			)}

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
