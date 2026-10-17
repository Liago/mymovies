'use client';

import { useMounted } from '@/hooks/useMounted';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search } from 'lucide-react';
import SearchResults from './SearchResults';
import PersonModal from './PersonModal';
import Segmented from './ui/Segmented';
import { SEARCH_FILTERS, useSearch } from '@/hooks/useSearch';

interface SearchOverlayProps {
	isOpen: boolean;
	onClose: () => void;
}

/**
 * Ricerca in modale (pulsante 🔍 o ⌘K): filtri Tutto / Film / Serie TV /
 * Persone e risultati live. Si chiude con Esc o cliccando fuori.
 */
export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
	const { query, setQuery, filter, setFilter, results, isLoading, hasQuery } = useSearch();
	const [personId, setPersonId] = useState<number | null>(null);
	const mounted = useMounted();
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!isOpen) {
			setQuery('');
			setFilter('all');
			return;
		}
		const t = setTimeout(() => inputRef.current?.focus(), 30);
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			clearTimeout(t);
			document.body.style.overflow = previous;
		};
	}, [isOpen, setQuery, setFilter]);

	useEffect(() => {
		if (!isOpen || personId) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isOpen, onClose, personId]);

	const closePerson = useCallback(() => setPersonId(null), []);

	if (!mounted || !isOpen) return null;

	return createPortal(
		<>
			<div
				className="fixed inset-0 z-[200] flex justify-center items-start pt-[90px] px-4 bg-black/40 backdrop-blur-[8px] animate-fade-in"
				onClick={onClose}
				role="dialog"
				aria-modal="true"
				aria-label="Cerca"
			>
				<div
					className="w-[min(720px,100%)] max-h-[calc(100dvh-180px)] overflow-auto no-scrollbar bg-card text-fg border border-line rounded-[24px] shadow-modal animate-pop-in"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="flex items-center gap-3 px-[22px] py-[18px] border-b border-line">
						<Search size={20} className="text-fg3 shrink-0" />
						<input
							ref={inputRef}
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Film, serie TV, persone"
							className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[20px] font-semibold text-fg placeholder:text-fg3"
							aria-label="Cerca film, serie TV e persone"
						/>
						<button
							type="button"
							onClick={onClose}
							className="shrink-0 text-[12px] font-bold text-fg3 px-[9px] py-1 rounded-[7px] bg-bg2 hover:opacity-80"
						>
							esc
						</button>
					</div>
					<Segmented
						variant="chips"
						size="sm"
						className="px-[22px] pt-3.5 pb-1"
						ariaLabel="Filtra risultati"
						items={SEARCH_FILTERS.map((f) => ({
							key: f.key,
							label: f.label,
							active: filter === f.key,
							onClick: () => setFilter(f.key),
						}))}
					/>
					<div className="px-3 pt-2 pb-3.5">
						{hasQuery ? (
							<SearchResults results={results} isLoading={isLoading} onNavigate={onClose} onSelectPerson={setPersonId} />
						) : (
							<div className="p-7 text-center text-[14px] font-semibold text-fg3">
								Cerca tra film, serie TV e persone
							</div>
						)}
					</div>
				</div>
			</div>
			<PersonModal personId={personId} onClose={closePerson} />
		</>,
		document.body
	);
}
