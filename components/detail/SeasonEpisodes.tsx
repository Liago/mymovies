'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
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

/** Tab "Episodi": stagioni a pillole, progresso e lista episodi da spuntare. */
export default function SeasonEpisodes({ tvId, title, poster, seasons, airedSeasons }: SeasonEpisodesProps) {
	const { isWatched, toggleWatched, markSeasonWatched, markSeasonUnwatched, isLoading: trackerLoading } = useTracker();
	const [selected, setSelected] = useState<number | null>(null);
	// Episodi per stagione; null = caricamento fallito
	const [data, setData] = useState<Map<number, Episode[] | null>>(new Map());

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
				if (!cancelled) setData((prev) => new Map(prev).set(season, res ? (res.episodes as Episode[]) : null));
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

	const episodes = season != null ? data.get(season) ?? undefined : undefined;
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

	return (
		<div className="flex flex-col gap-4 md:gap-5">
			<div className="flex gap-2 md:gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
				{seasons.map((s) => {
					const active = s.seasonNumber === season;
					return (
						<button
							key={s.seasonNumber}
							type="button"
							onClick={() => setSelected(s.seasonNumber)}
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
						return (
							<div
								key={ep.id}
								className="grid grid-cols-[96px_minmax(0,1fr)_44px] md:grid-cols-[160px_minmax(0,1fr)_auto] gap-3 md:gap-4 items-center py-2 md:p-2.5 border-b border-line md:border md:rounded-[18px] md:bg-card"
							>
								<Artwork
									src={ep.stillPath}
									alt={ep.name}
									className={cn('aspect-video rounded-[10px] md:rounded-[12px] transition-opacity', watched && 'opacity-[0.62]')}
								/>
								<div className="flex flex-col gap-[3px] min-w-0">
									<span className="hidden md:block text-[12px] font-bold text-fg3">{details}</span>
									<span className="text-[14px] md:text-[16px] font-bold truncate">
										<span className="md:hidden">E{ep.episodeNumber} · </span>
										{ep.name}
									</span>
									<span className="md:hidden text-[12px] font-semibold text-fg3">
										{released ? (ep.runtime ? `${ep.runtime} min` : date) : `In uscita · ${date ?? 'data da definire'}`}
									</span>
									{!released && <span className="hidden md:block text-[12px] font-semibold text-acc">Non ancora uscito</span>}
								</div>
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
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
