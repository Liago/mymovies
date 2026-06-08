'use client';

import { Filter, Monitor, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { WatchlistProviderRef } from '@/app/actions';

interface WatchlistProviderFilterProps {
	providers: WatchlistProviderRef[];
	selected: Set<number>;
	onToggle: (providerId: number) => void;
	onClear: () => void;
	counts?: Map<number, number>;
}

export default function WatchlistProviderFilter({
	providers,
	selected,
	onToggle,
	onClear,
	counts,
}: WatchlistProviderFilterProps) {
	const { t } = useLanguage();

	if (providers.length === 0) return null;

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
				<Filter size={12} />
				<span>{t('watchlist.filter_providers')}</span>
				{selected.size > 0 && (
					<button
						type="button"
						onClick={onClear}
						className="ml-2 inline-flex items-center gap-1 text-[10px] font-medium normal-case tracking-normal text-gray-400 hover:text-white transition-colors"
					>
						<X size={11} />
						{t('watchlist.filter_clear')}
					</button>
				)}
			</div>

			<div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 self-start">
				{providers.map((p) => {
					const active = selected.has(p.id);
					const count = counts?.get(p.id) ?? 0;
					return (
						<button
							key={p.id}
							type="button"
							onClick={() => onToggle(p.id)}
							title={p.name}
							className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
								active
									? 'bg-primary text-white shadow-lg shadow-primary/25'
									: 'text-gray-300 hover:text-white hover:bg-white/5'
							}`}
						>
							{p.logoPath ? (
								<img
									src={`https://image.tmdb.org/t/p/w92${p.logoPath}`}
									alt={p.name}
									className="w-5 h-5 rounded object-cover"
									loading="lazy"
								/>
							) : (
								<Monitor size={14} />
							)}
							<span className="hidden sm:inline">{p.name}</span>
							<span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-white/10'}`}>
								{count}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
