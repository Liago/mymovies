'use client';

import { useCallback, useState } from 'react';
import { Search, X } from 'lucide-react';
import SearchResults from '../SearchResults';
import PersonModal from '../PersonModal';
import Segmented from '../ui/Segmented';
import { SEARCH_FILTERS, useSearch } from '@/hooks/useSearch';

/**
 * Esplora (mobile): campo di ricerca in alto; a ricerca vuota mostra il
 * catalogo passato come children.
 */
export default function ExploreSearch({ children }: { children: React.ReactNode }) {
	const { query, setQuery, filter, setFilter, results, isLoading, hasQuery } = useSearch();
	const [personId, setPersonId] = useState<number | null>(null);
	const closePerson = useCallback(() => setPersonId(null), []);

	return (
		<>
			<div className="flex items-center gap-2.5 h-12 px-3.5 rounded-[14px] bg-bg2">
				<Search size={18} className="text-fg3 shrink-0" />
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Film, serie TV, persone"
					className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[16px] font-semibold text-fg placeholder:text-fg3"
					aria-label="Cerca film, serie TV e persone"
					enterKeyHint="search"
				/>
				{hasQuery && (
					<button type="button" onClick={() => setQuery('')} className="w-8 h-8 rounded-full flex items-center justify-center text-fg3" aria-label="Cancella">
						<X size={16} />
					</button>
				)}
			</div>

			{hasQuery ? (
				<>
					<Segmented
						variant="chips"
						ariaLabel="Filtra risultati"
						className="-mx-4 px-4 md:mx-0 md:px-0"
						items={SEARCH_FILTERS.map((f) => ({
							key: f.key,
							label: f.label,
							active: filter === f.key,
							onClick: () => setFilter(f.key),
						}))}
					/>
					<SearchResults results={results} isLoading={isLoading} onSelectPerson={setPersonId} dense />
				</>
			) : (
				children
			)}

			<PersonModal personId={personId} onClose={closePerson} />
		</>
	);
}
