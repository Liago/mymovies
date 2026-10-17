'use client';

import { Check } from 'lucide-react';
import { useTracker } from '@/context/TrackerContext';
import { useEpisodeInfo } from '@/hooks/useShowsProgress';
import { computeProgress, type AiredSeason } from '@/lib/progress';
import { episodeCode, formatDate } from '@/lib/format';

interface NextEpisodeBoxProps {
	tvId: number;
	title: string;
	poster: string | null;
	seasons: AiredSeason[];
	/** Prossima messa in onda annunciata (per lo stato "Sei in pari"). */
	upcoming?: { season: number; episode: number; airDate: string | null } | null;
	variant: 'aside' | 'compact';
}

/** Riquadro "Prossimo episodio" con progresso totale e azione rapida. */
export default function NextEpisodeBox({ tvId, title, poster, seasons, upcoming, variant }: NextEpisodeBoxProps) {
	const { watchedEpisodes, toggleWatched } = useTracker();
	const progress = computeProgress(seasons, (s, e) => watchedEpisodes.has(`${tvId}:${s}:${e}`));
	const next = progress.next;
	const info = useEpisodeInfo(tvId, next?.season, next?.episode);

	const mark = () => next && toggleWatched(tvId, next.season, next.episode, { name: title, poster });
	const totalLabel = `${progress.watched}/${progress.total} episodi`;
	const upcomingLabel =
		!next && upcoming?.airDate
			? `${episodeCode(upcoming.season, upcoming.episode)} in arrivo il ${formatDate(upcoming.airDate, { day: 'numeric', month: 'long' })}`
			: null;

	if (progress.total === 0) {
		if (!upcoming?.airDate) return null;
		return (
			<div className="p-[14px] md:p-5 rounded-[18px] md:rounded-[22px] bg-acc-soft flex flex-col gap-1.5">
				<span className="text-[11px] md:text-[12px] font-bold text-acc">PRIMA PUNTATA</span>
				<span className="text-[15px] md:text-[20px] font-extrabold">{formatDate(upcoming.airDate)}</span>
			</div>
		);
	}

	if (variant === 'compact') {
		return (
			<div className="p-[14px] rounded-[18px] bg-acc-soft flex items-center gap-3">
				<span className="flex-1 min-w-0 flex flex-col gap-0.5">
					<span className="text-[11px] font-bold text-acc">PROSSIMO EPISODIO</span>
					<span className="text-[15px] font-bold truncate">
						{next ? `${episodeCode(next.season, next.episode)}${info?.name ? ` · ${info.name}` : ''}` : 'Sei in pari'}
					</span>
					<span className="text-[12px] font-semibold text-fg2">{upcomingLabel ?? totalLabel}</span>
				</span>
				{next && (
					<button
						type="button"
						onClick={mark}
						className="w-12 h-12 shrink-0 rounded-full bg-acc text-accfg flex items-center justify-center"
						aria-label="Segna come visto"
					>
						<Check size={20} />
					</button>
				)}
			</div>
		);
	}

	return (
		<div className="p-5 rounded-[22px] bg-acc-soft flex flex-col gap-3">
			<span className="text-[12px] font-bold text-acc">PROSSIMO EPISODIO</span>
			{next ? (
				<>
					<span className="text-[22px] font-extrabold tracking-[-0.02em] leading-tight">{info?.name || `Episodio ${next.episode}`}</span>
					<span className="text-[13px] font-semibold text-fg2 -mt-2">{episodeCode(next.season, next.episode)}</span>
					<button
						type="button"
						onClick={mark}
						className="h-[46px] rounded-full bg-acc text-accfg text-[14px] font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
					>
						<Check size={16} />
						Segna come visto
					</button>
				</>
			) : (
				<>
					<span className="text-[20px] font-extrabold">Sei in pari</span>
					{upcomingLabel && <span className="text-[13px] font-semibold text-fg2 -mt-2">{upcomingLabel}</span>}
				</>
			)}
			<div className="flex items-center gap-2.5">
				<span className="flex-1 h-[5px] rounded-full bg-line overflow-hidden">
					<span className="block h-full rounded-full bg-acc transition-[width] duration-300" style={{ width: `${progress.pct}%` }} />
				</span>
				<span className="text-[12px] font-bold text-fg2 tabular-nums">{totalLabel}</span>
			</div>
		</div>
	);
}
