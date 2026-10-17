'use client';

import Link from 'next/link';
import type { SearchResult } from '@/app/api/search/route';
import Artwork from './ui/Artwork';
import { RESULT_KIND } from '@/hooks/useSearch';
import { cn } from '@/lib/cn';

interface SearchResultsProps {
	results: SearchResult[];
	isLoading: boolean;
	/** Chiamato quando si apre un titolo (es. per chiudere l'overlay). */
	onNavigate?: () => void;
	/** Le persone non hanno una pagina: si apre la scheda in un modale. */
	onSelectPerson: (id: number) => void;
	dense?: boolean;
}

/** Elenco risultati: miniatura 44px, titolo, sottotitolo e badge tipo. */
export default function SearchResults({ results, isLoading, onNavigate, onSelectPerson, dense = false }: SearchResultsProps) {
	if (isLoading && results.length === 0) {
		return (
			<div className="flex flex-col">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className={cn('flex items-center gap-3.5', dense ? 'py-1.5' : 'p-2.5')}>
						<span className="w-11 h-[66px] rounded-lg bg-ph1 animate-pulse" />
						<span className="flex-1 flex flex-col gap-2">
							<span className="h-3.5 w-1/2 rounded bg-ph1 animate-pulse" />
							<span className="h-3 w-1/3 rounded bg-ph2 animate-pulse" />
						</span>
					</div>
				))}
			</div>
		);
	}

	if (results.length === 0) {
		return <div className="p-7 text-center text-[14px] font-semibold text-fg3">Nessun risultato</div>;
	}

	return (
		<div className="flex flex-col">
			{results.map((r) => {
				const isPerson = r.type === 'person';
				const body = (
					<>
						<Artwork
							src={r.poster}
							alt={r.title}
							className={cn('w-11 shrink-0', isPerson ? 'h-11 rounded-full' : 'h-[66px] rounded-lg')}
						/>
						<span className="flex-1 min-w-0 flex flex-col gap-0.5 text-left">
							<span className="text-[15px] font-bold truncate">{r.title}</span>
							<span className="text-[12px] md:text-[13px] font-medium text-fg3 truncate">{r.subtitle}</span>
						</span>
						<span className="shrink-0 text-[10px] md:text-[11px] font-bold text-fg2 px-2 py-1 rounded-[7px] bg-bg2">
							{RESULT_KIND[r.type]}
						</span>
					</>
				);
				const cls = cn(
					'flex items-center gap-3 md:gap-3.5 rounded-[14px] transition-colors duration-150',
					dense ? 'py-1.5' : 'p-2.5 hover:bg-bg2'
				);

				return isPerson ? (
					<button key={`person-${r.id}`} type="button" onClick={() => onSelectPerson(Number(r.id))} className={cls}>
						{body}
					</button>
				) : (
					<Link key={`${r.type}-${r.id}`} href={`/${r.type}/${r.id}`} onClick={onNavigate} className={cls}>
						{body}
					</Link>
				);
			})}
		</div>
	);
}
