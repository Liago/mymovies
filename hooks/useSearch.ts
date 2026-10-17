'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { SearchResult } from '@/app/api/search/route';

export type SearchFilter = 'all' | 'movie' | 'tv' | 'person';

export const SEARCH_FILTERS: { key: SearchFilter; label: string }[] = [
	{ key: 'all', label: 'Tutto' },
	{ key: 'movie', label: 'Film' },
	{ key: 'tv', label: 'Serie TV' },
	{ key: 'person', label: 'Persone' },
];

export const RESULT_KIND: Record<SearchResult['type'], string> = {
	movie: 'Film',
	tv: 'Serie',
	person: 'Persona',
};

/** Ricerca TMDB `search/multi` con debounce di 250ms e filtro per tipo. */
export function useSearch(initialQuery: string = '') {
	const [query, setQuery] = useState(initialQuery);
	const [filter, setFilter] = useState<SearchFilter>('all');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const requestId = useRef(0);

	useEffect(() => {
		const q = query.trim();
		if (!q) {
			setResults([]);
			setIsLoading(false);
			return;
		}

		const id = ++requestId.current;
		setIsLoading(true);
		const timer = setTimeout(async () => {
			try {
				const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
				const data = await response.json();
				if (id === requestId.current) setResults(data.results || []);
			} catch (error) {
				console.error('Search error:', error);
				if (id === requestId.current) setResults([]);
			} finally {
				if (id === requestId.current) setIsLoading(false);
			}
		}, 250);

		return () => clearTimeout(timer);
	}, [query]);

	const filtered = useMemo(
		() => (filter === 'all' ? results : results.filter((r) => r.type === filter)),
		[results, filter]
	);

	return { query, setQuery, filter, setFilter, results: filtered, isLoading, hasQuery: query.trim().length > 0 };
}
