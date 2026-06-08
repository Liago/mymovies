'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Filter, Monitor, Search, X } from 'lucide-react';
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
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');

	// Lock body scroll and close on Escape while the panel is open.
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		document.addEventListener('keydown', onKey);
		document.body.style.overflow = 'hidden';
		return () => {
			document.removeEventListener('keydown', onKey);
			document.body.style.overflow = '';
		};
	}, [open]);

	// Reset the search box each time the panel opens.
	useEffect(() => {
		if (open) setQuery('');
	}, [open]);

	const selectedProviders = useMemo(
		() => providers.filter((p) => selected.has(p.id)),
		[providers, selected]
	);

	const filteredProviders = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return providers;
		return providers.filter((p) => p.name.toLowerCase().includes(q));
	}, [providers, query]);

	if (providers.length === 0) return null;

	return (
		<div className="flex flex-wrap items-center gap-2">
			{/* Compact trigger */}
			<button
				type="button"
				onClick={() => setOpen(true)}
				className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
					selected.size > 0
						? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
						: 'bg-white/5 text-gray-200 border-white/10 hover:bg-white/10'
				}`}
			>
				<Filter size={15} />
				<span>{t('watchlist.filter_button')}</span>
				{selected.size > 0 && (
					<span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-white/20 text-xs font-bold">
						{selected.size}
					</span>
				)}
			</button>

			{/* Active selections as removable chips */}
			{selectedProviders.map((p) => (
				<button
					key={p.id}
					type="button"
					onClick={() => onToggle(p.id)}
					title={p.name}
					className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-200 hover:bg-white/15 transition-colors"
				>
					{p.logoPath ? (
						<img
							src={`https://image.tmdb.org/t/p/w92${p.logoPath}`}
							alt=""
							className="w-4 h-4 rounded object-cover"
							loading="lazy"
						/>
					) : (
						<Monitor size={12} />
					)}
					<span className="max-w-28 truncate">{p.name}</span>
					<X size={12} className="text-gray-400" />
				</button>
			))}

			{selected.size > 0 && (
				<button
					type="button"
					onClick={onClear}
					className="text-xs font-medium text-gray-400 hover:text-white transition-colors px-1"
				>
					{t('watchlist.filter_clear')}
				</button>
			)}

			{/* Overlay panel: bottom sheet on mobile, centered modal on larger screens */}
			{open && (
				<div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
					<div
						className="absolute inset-0 bg-black/60 backdrop-blur-sm"
						onClick={() => setOpen(false)}
					/>

					<div className="relative w-full sm:max-w-md bg-zinc-900 border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[82vh] sm:max-h-[70vh]">
						{/* Grab handle (mobile) */}
						<div className="sm:hidden pt-3 flex justify-center">
							<div className="w-10 h-1 rounded-full bg-white/20" />
						</div>

						{/* Header */}
						<div className="flex items-center justify-between gap-2 px-5 pt-4 pb-3 border-b border-white/10">
							<div className="flex items-center gap-2 text-sm font-bold text-white">
								<Filter size={15} />
								<span>{t('watchlist.filter_providers')}</span>
							</div>
							<div className="flex items-center gap-3">
								{selected.size > 0 && (
									<button
										type="button"
										onClick={onClear}
										className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
									>
										{t('watchlist.filter_clear')}
									</button>
								)}
								<button
									type="button"
									onClick={() => setOpen(false)}
									className="p-1.5 -mr-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
									aria-label="Close"
								>
									<X size={18} />
								</button>
							</div>
						</div>

						{/* Search (only worth showing for longer lists) */}
						{providers.length > 8 && (
							<div className="px-5 pt-3">
								<div className="relative">
									<Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
									<input
										type="text"
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										placeholder={t('watchlist.filter_search')}
										className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/60"
									/>
								</div>
							</div>
						)}

						{/* List */}
						<div className="flex-1 overflow-y-auto px-3 py-3">
							{filteredProviders.length === 0 ? (
								<p className="text-center text-sm text-gray-500 py-8">—</p>
							) : (
								<ul className="flex flex-col gap-0.5">
									{filteredProviders.map((p) => {
										const active = selected.has(p.id);
										const count = counts?.get(p.id) ?? 0;
										return (
											<li key={p.id}>
												<button
													type="button"
													onClick={() => onToggle(p.id)}
													className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
														active ? 'bg-primary/15' : 'hover:bg-white/5'
													}`}
												>
													{p.logoPath ? (
														<img
															src={`https://image.tmdb.org/t/p/w92${p.logoPath}`}
															alt=""
															className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
															loading="lazy"
														/>
													) : (
														<span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
															<Monitor size={16} className="text-gray-400" />
														</span>
													)}
													<span className={`flex-1 text-sm font-medium truncate ${active ? 'text-white' : 'text-gray-300'}`}>
														{p.name}
													</span>
													<span className="text-xs text-gray-500 tabular-nums">{count}</span>
													<span
														className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
															active ? 'bg-primary border-primary' : 'border-white/20'
														}`}
													>
														{active && <Check size={13} className="text-white" />}
													</span>
												</button>
											</li>
										);
									})}
								</ul>
							)}
						</div>

						{/* Footer */}
						<div className="px-5 py-3 border-t border-white/10">
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="w-full py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-colors"
							>
								{t('watchlist.filter_done')}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
