'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import MovieCard from '../MovieCard';
import { fetchCatalogPage } from '@/app/actions';
import type { CatalogItem, CatalogList, CatalogType } from '@/lib/tmdb-catalog';

interface CatalogGridProps {
	list: CatalogList;
	type: CatalogType;
	genre: number | null;
	initialItems: CatalogItem[];
	totalPages: number;
	genreNames: Record<number, string>;
	/** Badge fisso (es. "Al cinema") al posto del servizio streaming. */
	badge?: string | null;
}

/** Griglia del catalogo con caricamento progressivo allo scroll. */
export default function CatalogGrid({ list, type, genre, initialItems, totalPages, genreNames, badge }: CatalogGridProps) {
	const [items, setItems] = useState(initialItems);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const sentinel = useRef<HTMLDivElement>(null);
	const hasMore = page < totalPages;

	const loadMore = useCallback(async () => {
		if (loading || !hasMore) return;
		setLoading(true);
		try {
			const next = await fetchCatalogPage(list, type, genre, page + 1);
			setItems((prev) => {
				const seen = new Set(prev.map((i) => i.id));
				return [...prev, ...next.results.filter((i) => !seen.has(i.id))];
			});
			setPage((p) => p + 1);
		} finally {
			setLoading(false);
		}
	}, [loading, hasMore, list, type, genre, page]);

	useEffect(() => {
		const el = sentinel.current;
		if (!el || !hasMore) return;
		const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && loadMore(), { rootMargin: '600px' });
		observer.observe(el);
		return () => observer.disconnect();
	}, [loadMore, hasMore]);

	if (!items.length) {
		return <p className="py-16 text-center text-[15px] font-semibold text-fg3">Nessun titolo trovato.</p>;
	}

	return (
		<>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-x-3 gap-y-4 md:gap-x-[18px] md:gap-y-6">
				{items.map((m) => (
					<MovieCard
						key={`${m.type}-${m.id}`}
						id={m.id}
						title={m.title}
						poster={m.poster}
						rating={m.rating}
						year={m.year}
						type={m.type}
						badge={badge}
						subtitle={[genreNames[m.genreIds[0]], m.year].filter(Boolean).join(' · ') || null}
					/>
				))}
			</div>
			<div ref={sentinel} className="flex justify-center pt-4">
				{hasMore && (
					<button
						type="button"
						onClick={loadMore}
						disabled={loading}
						className="h-11 px-6 rounded-full bg-bg2 text-[14px] font-bold disabled:opacity-60 transition-opacity hover:opacity-80"
					>
						{loading ? 'Caricamento…' : 'Carica altri'}
					</button>
				)}
			</div>
		</>
	);
}
