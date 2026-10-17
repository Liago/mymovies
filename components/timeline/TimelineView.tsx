'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Check, Tv } from 'lucide-react';
import { fetchCalendarEpisodes } from '@/app/actions';
import { useTracker } from '@/context/TrackerContext';
import Artwork from '../ui/Artwork';
import PageHeader from '../ui/PageHeader';
import type { CalendarEpisode, CalendarResult } from '@/lib/tmdb-shows';
import { dayLabel, parseISODate, toISODate, weekDays, weekRangeLabel, weekdayShort } from '@/lib/week';
import { episodeShortCode } from '@/lib/format';
import { cn } from '@/lib/cn';

const subscribeNoop = () => () => {};
const getToday = () => toISODate(new Date());

/** Data odierna (YYYY-MM-DD) nel fuso dell'utente; null durante il render sul server. */
function useToday(): string | null {
	return useSyncExternalStore(subscribeNoop, getToday, () => null);
}

function EpisodeRow({ ep, today, showDate }: { ep: CalendarEpisode; today: string; showDate?: boolean }) {
	const { isWatched, toggleWatched } = useTracker();
	const watched = isWatched(ep.showId, ep.season, ep.episode);
	const released = ep.airDate <= today;
	const code = episodeShortCode(ep.season, ep.episode);

	return (
		<div className="grid grid-cols-[84px_minmax(0,1fr)_44px] md:grid-cols-[128px_minmax(0,1fr)_auto_44px] gap-2.5 md:gap-4 items-center p-2 md:p-2.5 rounded-[16px] md:rounded-[18px] bg-card border border-line">
			<Link href={`/tv/${ep.showId}`} className="hover:opacity-80 transition-opacity">
				<Artwork src={ep.still} alt={ep.showName} className={cn('aspect-video rounded-[8px] md:rounded-[10px]', watched && 'opacity-[0.62]')} />
			</Link>
			<Link href={`/tv/${ep.showId}`} className="flex flex-col gap-px md:gap-0.5 min-w-0 hover:opacity-80 transition-opacity">
				<span className="text-[14px] md:text-[16px] font-bold truncate">{ep.showName}</span>
				<span className="text-[12px] md:text-[13px] font-semibold text-fg3 truncate">
					<span className="hidden md:inline">Episodio {code}</span>
					<span className="md:hidden">{[code, ep.provider].filter(Boolean).join(' · ')}</span>
					{ep.name && !/^Episodio \d+$/i.test(ep.name) ? ` · ${ep.name}` : ''}
					{showDate ? ` · ${dayLabel(parseISODate(ep.airDate))}` : ''}
				</span>
			</Link>
			{ep.provider ? (
				<span className="hidden md:inline-block px-2.5 py-[5px] rounded-lg bg-bg2 text-[12px] font-bold whitespace-nowrap">{ep.provider}</span>
			) : (
				<span className="hidden md:block" />
			)}
			<button
				type="button"
				onClick={() => toggleWatched(ep.showId, ep.season, ep.episode, { name: ep.showName, poster: ep.showPoster })}
				disabled={!released && !watched}
				aria-pressed={watched}
				aria-label={watched ? 'Segna come non visto' : 'Segna come visto'}
				title={released ? (watched ? 'Visto' : 'Segna come visto') : 'Non ancora uscito'}
				className={cn(
					'w-11 h-11 rounded-full border-[1.5px] flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
					watched ? 'bg-acc border-acc text-accfg' : 'border-line text-fg3 hover:text-fg hover:border-fg3'
				)}
			>
				<Check size={17} />
			</button>
		</div>
	);
}

/** Timeline: la settimana delle serie seguite, filtrabile per giorno. */
export default function TimelineView({ initialDay }: { initialDay?: string | null }) {
	const { watchedShows, isLoading: trackerLoading } = useTracker();
	// La settimana va calcolata nel browser (fuso orario dell'utente), non sul server
	const todayIso = useToday();
	const today = todayIso ?? '';
	const days = useMemo(() => weekDays(todayIso ? parseISODate(todayIso) : new Date(0)), [todayIso]);
	const isoDays = useMemo(() => days.map(toISODate), [days]);
	// undefined = nessuna scelta dell'utente: vale il parametro `day` dell'URL
	const [picked, setPicked] = useState<string | null | undefined>(undefined);
	const selected = picked !== undefined ? picked : initialDay && isoDays.includes(initialDay) ? initialDay : null;

	const idsKey = useMemo(() => Array.from(watchedShows.keys()).sort((a, b) => a - b).join(','), [watchedShows]);
	const requestKey = todayIso && idsKey ? `${idsKey}|${isoDays[0]}` : null;
	const [result, setResult] = useState<{ key: string; data: CalendarResult } | null>(null);

	useEffect(() => {
		if (trackerLoading || !requestKey) return;
		let cancelled = false;
		fetchCalendarEpisodes(idsKey.split(',').map(Number), isoDays[0], isoDays[6])
			.then((data) => !cancelled && setResult({ key: requestKey, data }))
			.catch(() => !cancelled && setResult({ key: requestKey, data: { inRange: [], later: [] } }));
		return () => {
			cancelled = true;
		};
	}, [requestKey, idsKey, trackerLoading, isoDays]);

	const data = useMemo<CalendarResult | null>(
		() => (!idsKey ? { inRange: [], later: [] } : result && result.key === requestKey ? result.data : null),
		[idsKey, result, requestKey]
	);

	const pick = (iso: string) => {
		const next = selected === iso ? null : iso;
		setPicked(next);
		const url = new URL(window.location.href);
		if (next) url.searchParams.set('day', next);
		else url.searchParams.delete('day');
		window.history.replaceState(window.history.state, '', url.toString());
	};

	const byDay = useMemo(() => {
		const map = new Map<string, CalendarEpisode[]>();
		for (const ep of data?.inRange || []) {
			const list = map.get(ep.airDate) || [];
			list.push(ep);
			map.set(ep.airDate, list);
		}
		return map;
	}, [data]);

	const range = todayIso ? weekRangeLabel(days) : '';
	const loading = trackerLoading || data === null || !todayIso;
	const noShows = !trackerLoading && watchedShows.size === 0;
	const visibleDays = isoDays.filter((iso) => (selected ? iso === selected : byDay.has(iso)));

	return (
		<>
			<PageHeader
				eyebrow="Timeline"
				title={
					<>
						<span className="md:hidden">Timeline</span>
						<span className="hidden md:inline">Questa settimana</span>
					</>
				}
				subtitle={
					<>
						<span className="hidden md:inline">Nuovi episodi delle serie che segui · </span>
						{range}
					</>
				}
			/>

			<div className={cn('grid grid-cols-7 gap-1 md:gap-2', !todayIso && 'invisible')}>
				{days.map((d, i) => {
					const iso = isoDays[i];
					const count = byDay.get(iso)?.length ?? 0;
					const isSelected = selected === iso;
					const isToday = iso === today;
					return (
						<button
							key={iso}
							type="button"
							onClick={() => pick(iso)}
							aria-pressed={isSelected}
							className={cn(
								'h-16 md:h-auto md:py-3 px-0 md:px-1.5 rounded-[14px] md:rounded-[16px] border flex flex-col items-center justify-center gap-px md:gap-0.5 transition-colors duration-150',
								isSelected
									? 'bg-fg text-bg border-line'
									: isToday
										? 'bg-acc-soft text-fg border-acc'
										: 'bg-card text-fg border-line hover:bg-bg2'
							)}
						>
							<span className="text-[10px] md:text-[12px] font-semibold opacity-70">{weekdayShort(d)}</span>
							<span className="text-[18px] md:text-[24px] font-extrabold leading-tight">{d.getDate()}</span>
							<span className="hidden md:block text-[11px] font-semibold opacity-70">
								{loading ? '·' : count ? `${count} ep.` : '—'}
							</span>
						</button>
					);
				})}
			</div>
			<span className="hidden md:block text-[12px] font-medium text-fg3">
				{selected ? 'Solo il giorno selezionato · tocca di nuovo per tornare alla settimana' : 'Tutta la settimana'}
			</span>

			{noShows ? (
				<div className="flex flex-col items-center text-center gap-3 py-14">
					<span className="w-16 h-16 rounded-full bg-bg2 flex items-center justify-center text-fg3">
						<Tv size={28} />
					</span>
					<h2 className="m-0 text-[20px] font-bold">Nessuna serie seguita</h2>
					<p className="m-0 max-w-sm text-[14px] font-medium text-fg3">
						Segui una serie dalla sua scheda o segna un episodio come visto: i nuovi episodi compariranno qui.
					</p>
					<Link href="/catalogo/trending?type=tv" className="mt-2 h-11 px-5 rounded-full bg-fg text-bg text-[14px] font-bold flex items-center">
						Scopri serie TV
					</Link>
				</div>
			) : loading ? (
				<div className="flex flex-col gap-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="h-[66px] md:h-[94px] rounded-[18px] placeholder-stripes" />
					))}
				</div>
			) : (
				<>
					{visibleDays.length === 0 ? (
						<p className="m-0 py-8 text-center text-[14px] font-semibold text-fg3">
							{selected ? 'Nessun episodio in questo giorno.' : 'Nessun nuovo episodio questa settimana.'}
						</p>
					) : (
						visibleDays.map((iso) => (
							<section key={iso} className="flex flex-col gap-1.5 md:gap-2">
								<h2 className="m-0 mt-1.5 md:mt-2 mb-0.5 text-[14px] md:text-[17px] font-bold">
									{iso === today ? 'Oggi · ' : ''}
									{dayLabel(parseISODate(iso))}
								</h2>
								{(byDay.get(iso) || []).map((ep) => (
									<EpisodeRow key={`${ep.showId}-${ep.season}-${ep.episode}`} ep={ep} today={today} />
								))}
							</section>
						))
					)}

					{!selected && data && data.later.length > 0 && (
						<section className="flex flex-col gap-1.5 md:gap-2 mt-2">
							<h2 className="m-0 text-[14px] md:text-[17px] font-bold">Più avanti</h2>
							{data.later.map((ep) => (
								<EpisodeRow key={`later-${ep.showId}-${ep.season}-${ep.episode}`} ep={ep} today={today} showDate />
							))}
						</section>
					)}
				</>
			)}
		</>
	);
}
