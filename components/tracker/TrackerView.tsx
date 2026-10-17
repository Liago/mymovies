'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Trophy, Tv } from 'lucide-react';
import { useTracker } from '@/context/TrackerContext';
import { useEpisodeInfo, useTrackedProgress, type TrackedItem } from '@/hooks/useShowsProgress';
import Artwork from '../ui/Artwork';
import PageHeader from '../ui/PageHeader';
import Segmented from '../ui/Segmented';
import StatCard from '../ui/StatCard';
import { episodeCode, formatCount, formatDate } from '@/lib/format';

export type TrackerStatus = 'in-corso' | 'da-iniziare' | 'completate';

const TABS: { key: TrackerStatus; label: string }[] = [
	{ key: 'in-corso', label: 'In corso' },
	{ key: 'da-iniziare', label: 'Da iniziare' },
	{ key: 'completate', label: 'Completate' },
];

function statusOf(item: TrackedItem): TrackerStatus | null {
	const p = item.progress;
	if (!p) return null;
	if (p.completed) return 'completate';
	if (p.started) return 'in-corso';
	return 'da-iniziare';
}

function TrackerRow({ item }: { item: TrackedItem }) {
	const { toggleWatched } = useTracker();
	const { show, info, progress } = item;
	const next = progress?.next;
	const episode = useEpisodeInfo(show.id, next?.season, next?.episode);
	if (!info || !progress) return null;

	const mark = () => {
		if (next) toggleWatched(show.id, next.season, next.episode, { name: show.name, poster: show.poster });
	};

	const nextLabel = next
		? `${episodeCode(next.season, next.episode)}${episode?.name ? ` · ${episode.name}` : ''}`
		: progress.total === 0
			? info.nextAirDate
				? `Prima puntata il ${formatDate(info.nextAirDate, { day: 'numeric', month: 'long' })}`
				: 'Non ancora in onda'
			: info.nextAirDate
				? `Nuovo episodio il ${formatDate(info.nextAirDate, { day: 'numeric', month: 'long' })}`
				: 'Hai visto tutto';

	return (
		<div className="relative grid grid-cols-[52px_minmax(0,1fr)_48px] md:grid-cols-[64px_minmax(0,1fr)_minmax(160px,240px)_auto] gap-3 md:gap-[18px] items-center p-2.5 rounded-[18px] md:rounded-[20px] bg-card border border-line transition-opacity hover:opacity-90">
			<Link href={`/tv/${show.id}`} className="absolute inset-0 z-[1] rounded-[inherit]" aria-label={show.name} />
			<Artwork src={show.poster || info.poster} alt={show.name} className="aspect-[2/3] rounded-[8px] md:rounded-[10px]" />
			<span className="flex flex-col gap-1 md:gap-[3px] min-w-0">
				<span className="text-[15px] md:text-[17px] font-bold truncate">{show.name}</span>
				<span className="text-[12px] md:text-[13px] font-semibold text-fg3 truncate">
					<span className="hidden md:inline">{next ? 'Prossimo: ' : ''}</span>
					{nextLabel}
				</span>
				{info.provider && <span className="hidden md:block text-[12px] font-semibold text-fg3">{info.provider}</span>}
				<span className="md:hidden flex items-center gap-2">
					<span className="flex-1 h-[5px] rounded-full bg-bg2 overflow-hidden">
						<span className="block h-full bg-acc transition-[width] duration-300" style={{ width: `${progress.pct}%` }} />
					</span>
					<span className="text-[11px] font-bold text-fg2 tabular-nums">
						{progress.watched}/{progress.total}
					</span>
				</span>
			</span>
			<span className="hidden md:flex flex-col gap-1.5">
				<span className="h-1.5 rounded-full bg-bg2 overflow-hidden">
					<span className="block h-full rounded-full bg-acc transition-[width] duration-300" style={{ width: `${progress.pct}%` }} />
				</span>
				<span className="text-[12px] font-bold text-fg2 tabular-nums">
					{progress.watched}/{progress.total} episodi
				</span>
			</span>
			{progress.completed ? (
				<span className="md:mr-1.5 w-12 md:w-auto h-12 md:h-[42px] md:px-4 rounded-full bg-acc-soft text-acc text-[13px] font-bold flex items-center justify-center gap-1.5">
					<Trophy size={18} className="md:w-4 md:h-4" />
					<span className="hidden md:inline">Completata</span>
				</span>
			) : next ? (
				<button
					type="button"
					onClick={mark}
					className="relative z-[2] md:mr-1.5 w-12 md:w-auto h-12 md:h-[42px] md:px-4 rounded-full bg-fg text-bg text-[13px] font-bold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-85"
					aria-label={`Segna ${episodeCode(next.season, next.episode)} come visto`}
				>
					<Check size={18} className="md:w-4 md:h-4" />
					<span className="hidden md:inline">Visto</span>
				</button>
			) : (
				<span />
			)}
		</div>
	);
}

/** Tracker: statistiche e progressi delle serie seguite. */
export default function TrackerView({ initialStatus }: { initialStatus: TrackerStatus }) {
	const { watchedEpisodes } = useTracker();
	const { items, loading, isEmpty } = useTrackedProgress();
	const [status, setStatus] = useState<TrackerStatus>(initialStatus);

	const pick = (next: TrackerStatus) => {
		setStatus(next);
		const url = new URL(window.location.href);
		if (next === 'in-corso') url.searchParams.delete('status');
		else url.searchParams.set('status', next);
		window.history.replaceState(window.history.state, '', url.toString());
	};

	const stats = useMemo(() => {
		let minutes = 0;
		let inProgress = 0;
		let completed = 0;
		for (const item of items) {
			if (!item.progress) continue;
			minutes += item.progress.watched * (item.info?.runtime || 40);
			if (item.progress.completed) completed++;
			else if (item.progress.started) inProgress++;
		}
		return { hours: Math.round(minutes / 60), inProgress, completed };
	}, [items]);

	const visible = items.filter((i) => statusOf(i) === status);
	const pending = items.filter((i) => !i.progress).length;

	const tabs = TABS.map((t) => ({ key: t.key, label: t.label, active: status === t.key, onClick: () => pick(t.key) }));

	return (
		<>
			<PageHeader
				eyebrow="Tracker"
				title={
					<>
						<span className="md:hidden">Tracker</span>
						<span className="hidden md:inline">I tuoi progressi</span>
					</>
				}
				actions={
					<div className="hidden md:block">
						<Segmented items={tabs} ariaLabel="Stato" />
					</div>
				}
			/>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
				<StatCard value={formatCount(watchedEpisodes.size)} label="Episodi visti" />
				<StatCard
					value={`${formatCount(stats.hours)} h`}
					label={
						<>
							<span className="md:hidden">Tempo totale</span>
							<span className="hidden md:inline">Tempo davanti allo schermo</span>
						</>
					}
				/>
				<div className="hidden md:block">
					<StatCard value={stats.inProgress} label="Serie in corso" />
				</div>
				<div className="hidden md:block">
					<StatCard value={stats.completed} label="Serie completate" />
				</div>
			</div>

			<Segmented items={tabs} ariaLabel="Stato" fill className="md:hidden [&>*]:h-10" />

			{isEmpty ? (
				<div className="flex flex-col items-center text-center gap-3 py-14">
					<span className="w-16 h-16 rounded-full bg-bg2 flex items-center justify-center text-fg3">
						<Tv size={28} />
					</span>
					<h2 className="m-0 text-[20px] font-bold">Non stai seguendo nessuna serie</h2>
					<p className="m-0 max-w-sm text-[14px] font-medium text-fg3">
						Apri una serie e tocca «Segui serie» oppure segna un episodio come visto per iniziare.
					</p>
					<Link href="/catalogo/trending?type=tv" className="mt-2 h-11 px-5 rounded-full bg-fg text-bg text-[14px] font-bold flex items-center">
						Scopri serie TV
					</Link>
				</div>
			) : (
				<div className="flex flex-col gap-2.5">
					{visible.map((item) => (
						<TrackerRow key={item.show.id} item={item} />
					))}
					{loading &&
						Array.from({ length: Math.min(Math.max(pending, 2), 4) }).map((_, i) => (
							<div key={`sk-${i}`} className="h-[96px] md:h-[118px] rounded-[20px] placeholder-stripes" />
						))}
					{!loading && visible.length === 0 && (
						<p className="m-0 py-8 text-center text-[14px] font-semibold text-fg3">
							{status === 'in-corso'
								? 'Nessuna serie in corso: sei in pari!'
								: status === 'da-iniziare'
									? 'Nessuna serie da iniziare.'
									: 'Non hai ancora completato nessuna serie.'}
						</p>
					)}
				</div>
			)}
		</>
	);
}
