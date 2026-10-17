'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Star } from 'lucide-react';
import { fetchTVSeasonDetails } from '@/app/actions';
import { useTracker } from '@/context/TrackerContext';
import Artwork from '../ui/Artwork';
import { computeProgress, type AiredSeason } from '@/lib/progress';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';

interface SeasonSummary {
	seasonNumber: number;
	episodeCount: number;
	name: string;
}

interface Episode {
	id: number;
	name: string;
	episodeNumber: number;
	seasonNumber: number;
	airDate: string | null;
	stillPath: string | null;
	runtime: number | null;
	overview?: string;
	voteAverage?: number;
	crew?: { job?: string; name: string }[];
	guestStars?: { id: number; name: string; character?: string }[];
}

interface SeasonData {
	overview: string;
	episodes: Episode[];
}

interface SeasonEpisodesProps {
	tvId: number;
	title: string;
	poster: string | null;
	seasons: SeasonSummary[];
	airedSeasons: AiredSeason[];
}

function isAired(airDate: string | null): boolean {
	if (!airDate) return false;
	return new Date(airDate).getTime() <= Date.now();
}

/** Tab "Episodi": stagioni a pillole, trama della stagione e lista episodi da spuntare. */
export default function SeasonEpisodes({ tvId, title, poster, seasons, airedSeasons }: SeasonEpisodesProps) {
	const { isWatched, toggleWatched, markSeasonWatched, markSeasonUnwatched, isLoading: trackerLoading } = useTracker();
	const [selected, setSelected] = useState<number | null>(null);
	// Trama ed episodi per stagione; null = caricamento fallito
	const [data, setData] = useState<Map<number, SeasonData | null>>(new Map());
	// Episodi aperti per leggerne la trama (id episodio)
	const [expanded, setExpanded] = useState<Set<number>>(new Set());
	const [seasonOverviewOpen, setSeasonOverviewOpen] = useState(false);

	// Stagione iniziale: quella del prossimo episodio da vedere (finché l'utente non ne sceglie una)
	const defaultSeason = useMemo(() => {
		if (!seasons.length) return null;
		if (trackerLoading) return seasons[0].seasonNumber;
		const progress = computeProgress(airedSeasons, (s, e) => isWatched(tvId, s, e));
		const fallback = progress.started ? airedSeasons[airedSeasons.length - 1]?.season : seasons[0].seasonNumber;
		return progress.next?.season ?? fallback ?? seasons[0].seasonNumber;
	}, [seasons, trackerLoading, airedSeasons, isWatched, tvId]);

	const season = selected ?? defaultSeason;

	useEffect(() => {
		if (season == null || data.has(season)) return;
		let cancelled = false;
		fetchTVSeasonDetails(tvId, season)
			.then((res) => {
				if (!cancelled)
					setData((prev) =>
						new Map(prev).set(season, res ? { overview: res.overview || '', episodes: res.episodes as Episode[] } : null)
					);
			})
			.catch(() => {
				if (!cancelled) setData((prev) => new Map(prev).set(season, null));
			});
		return () => {
			cancelled = true;
		};
	}, [season, tvId, data]);

	const loading = season != null && !data.has(season);
	const error = season != null && data.has(season) && data.get(season) === null;

	if (!seasons.length) {
		return <p className="m-0 text-[15px] font-medium text-fg3">Nessun episodio disponibile.</p>;
	}

	const seasonData = season != null ? data.get(season) ?? undefined : undefined;
	const episodes = seasonData?.episodes;
	const meta = { name: title, poster };
	const watchedIn = (s: SeasonSummary) =>
		Array.from({ length: s.episodeCount }, (_, i) => isWatched(tvId, s.seasonNumber, i + 1)).filter(Boolean).length;

	const aired = (episodes || []).filter((e) => isAired(e.airDate));
	const watchedCount = (episodes || []).filter((e) => isWatched(tvId, e.seasonNumber, e.episodeNumber)).length;
	const total = episodes?.length ?? seasons.find((s) => s.seasonNumber === season)?.episodeCount ?? 0;
	const allAiredWatched = aired.length > 0 && aired.every((e) => isWatched(tvId, e.seasonNumber, e.episodeNumber));

	const toggleSeason = () => {
		if (!episodes || season == null) return;
		setSelected(season); // resta sulla stagione corrente anche quando diventa "vista"
		if (allAiredWatched) markSeasonUnwatched(tvId, season, aired);
		else markSeasonWatched(tvId, season, aired, meta);
	};

	const toggleExpanded = (id: number) =>
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	return (
		<div className="flex flex-col gap-4 md:gap-5">
			<div className="flex gap-2 md:gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
				{seasons.map((s) => {
					const active = s.seasonNumber === season;
					return (
						<button
							key={s.seasonNumber}
							type="button"
							onClick={() => {
								setSelected(s.seasonNumber);
								setSeasonOverviewOpen(false);
							}}
							aria-pressed={active}
							className={cn(
								'shrink-0 h-12 md:h-[52px] px-3.5 md:px-[18px] rounded-[14px] md:rounded-[16px] border border-line flex flex-col items-start justify-center transition-colors duration-150',
								active ? 'bg-fg text-bg' : 'bg-card text-fg hover:bg-bg2'
							)}
						>
							<span className="text-[13px] md:text-[14px] font-bold">Stagione {s.seasonNumber}</span>
							<span className={cn('text-[11px] font-semibold opacity-75', active ? 'text-bg' : 'text-fg3')}>
								{watchedIn(s)}/{s.episodeCount} visti
							</span>
						</button>
					);
				})}
			</div>

			<div className="flex items-center gap-3 md:gap-4 flex-wrap">
				<span className="flex-1 min-w-[120px] h-1.5 rounded-full bg-bg2 overflow-hidden">
					<span
						className="block h-full rounded-full bg-acc transition-[width] duration-300"
						style={{ width: `${total ? Math.round((watchedCount / total) * 100) : 0}%` }}
					/>
				</span>
				<span className="text-[13px] font-semibold text-fg3 tabular-nums">
					{watchedCount} di {total} visti
				</span>
				<button
					type="button"
					onClick={toggleSeason}
					disabled={!aired.length}
					className="h-[34px] px-3.5 rounded-full bg-bg2 text-[13px] font-bold disabled:opacity-40 transition-opacity hover:opacity-80"
				>
					{allAiredWatched ? 'Segna stagione come non vista' : 'Segna stagione come vista'}
				</button>
			</div>

			{seasonData?.overview && (
				<div className="px-4 py-3.5 md:px-[18px] md:py-4 rounded-[16px] md:rounded-[18px] bg-card border border-line flex flex-col gap-1.5">
					<span className="text-[12px] font-bold text-fg3">Trama della stagione</span>
					<p
						className={cn(
							'm-0 text-[14px] md:text-[15px] leading-[1.55] font-medium text-fg2 whitespace-pre-line',
							!seasonOverviewOpen && 'line-clamp-3'
						)}
					>
						{seasonData.overview}
					</p>
					{seasonData.overview.length > 220 && (
						<button
							type="button"
							onClick={() => setSeasonOverviewOpen((v) => !v)}
							className="self-start text-[13px] font-bold text-acc hover:opacity-80"
						>
							{seasonOverviewOpen ? 'Mostra meno' : 'Leggi tutto'}
						</button>
					)}
				</div>
			)}

			{error ? (
				<p className="m-0 text-[14px] font-semibold text-fg3">Impossibile caricare gli episodi di questa stagione.</p>
			) : loading || !episodes ? (
				<div className="flex flex-col gap-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="h-[74px] md:h-[110px] rounded-[18px] placeholder-stripes" />
					))}
				</div>
			) : (
				<div className="flex flex-col md:gap-2">
					{episodes.map((ep) => {
						const watched = isWatched(tvId, ep.seasonNumber, ep.episodeNumber);
						const released = isAired(ep.airDate);
						const date = formatDate(ep.airDate, { day: 'numeric', month: 'short', year: 'numeric' });
						const details = [`E${ep.episodeNumber}`, date, ep.runtime ? `${ep.runtime} min` : null].filter(Boolean).join(' · ');
						const isOpen = expanded.has(ep.id);
						const panelId = `ep-${ep.id}-plot`;
						const directors = (ep.crew || []).filter((c) => c.job === 'Director').map((c) => c.name);
						const writers = (ep.crew || []).filter((c) => c.job === 'Writer' || c.job === 'Screenplay').map((c) => c.name);
						const guests = (ep.guestStars || []).slice(0, 6).map((g) => g.name);

						return (
							<div
								key={ep.id}
								className="grid grid-cols-[minmax(0,1fr)_44px] md:grid-cols-[minmax(0,1fr)_auto] gap-x-3 md:gap-x-4 items-center py-2 md:p-2.5 border-b border-line md:border md:rounded-[18px] md:bg-card"
							>
								{/* Tap sull'episodio: mostra/nasconde la trama */}
								<button
									type="button"
									onClick={() => toggleExpanded(ep.id)}
									aria-expanded={isOpen}
									aria-controls={panelId}
									title={isOpen ? 'Nascondi trama' : 'Mostra trama'}
									className="grid grid-cols-[96px_minmax(0,1fr)] md:grid-cols-[160px_minmax(0,1fr)] gap-3 md:gap-4 items-center text-left min-w-0 rounded-[12px] transition-opacity hover:opacity-85"
								>
									<Artwork
										src={ep.stillPath}
										alt={ep.name}
										className={cn('aspect-video rounded-[10px] md:rounded-[12px] transition-opacity', watched && 'opacity-[0.62]')}
									/>
									<span className="flex flex-col gap-[3px] min-w-0">
										<span className="hidden md:flex items-center gap-1.5 text-[12px] font-bold text-fg3">
											{details}
											<ChevronDown size={14} className={cn('transition-transform duration-200', isOpen && 'rotate-180')} />
										</span>
										<span className={cn('text-[14px] md:text-[16px] font-bold', isOpen ? 'whitespace-normal' : 'truncate')}>
											<span className="md:hidden">E{ep.episodeNumber} · </span>
											{ep.name}
										</span>
										<span className="md:hidden flex items-center gap-1 text-[12px] font-semibold text-fg3">
											{released ? (ep.runtime ? `${ep.runtime} min` : date) : `In uscita · ${date ?? 'data da definire'}`}
											<ChevronDown size={13} className={cn('transition-transform duration-200', isOpen && 'rotate-180')} />
										</span>
										{!released && <span className="hidden md:block text-[12px] font-semibold text-acc">Non ancora uscito</span>}
									</span>
								</button>

								<button
									type="button"
									onClick={() => {
										setSelected(ep.seasonNumber);
										toggleWatched(tvId, ep.seasonNumber, ep.episodeNumber, meta);
									}}
									disabled={!released && !watched}
									aria-pressed={watched}
									aria-label={watched ? `Segna E${ep.episodeNumber} come non visto` : `Segna E${ep.episodeNumber} come visto`}
									title={watched ? 'Visto' : 'Segna come visto'}
									className={cn(
										'w-11 h-11 md:mr-1.5 rounded-full border-[1.5px] flex items-center justify-center transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed',
										watched ? 'bg-acc border-acc text-accfg' : 'bg-transparent border-line text-fg3 hover:text-fg hover:border-fg3'
									)}
								>
									<Check size={18} />
								</button>

								{isOpen && (
									<div id={panelId} className="col-span-2 pt-3 md:pt-3.5 md:px-1.5 pb-1 flex flex-col gap-2.5 animate-fade-in">
										<p className="m-0 text-[14px] md:text-[15px] leading-[1.55] font-medium text-fg2 whitespace-pre-line">
											{ep.overview || 'Trama non ancora disponibile.'}
										</p>
										<div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] md:text-[13px] font-semibold text-fg3">
											{ep.airDate && (
												<span>
													{released ? 'Uscito il' : 'In uscita il'} {formatDate(ep.airDate)}
												</span>
											)}
											{ep.runtime ? <span>{ep.runtime} min</span> : null}
											{ep.voteAverage ? (
												<span className="flex items-center gap-1">
													<Star size={12} className="text-acc fill-current" />
													{ep.voteAverage.toFixed(1)}
												</span>
											) : null}
											{directors.length > 0 && <span>Regia: {directors.join(', ')}</span>}
											{writers.length > 0 && <span>Sceneggiatura: {writers.slice(0, 2).join(', ')}</span>}
										</div>
										{guests.length > 0 && (
											<p className="m-0 text-[12px] md:text-[13px] font-medium text-fg3">
												<span className="font-bold">Guest star:</span> {guests.join(', ')}
											</p>
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
