'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import Artwork from '../ui/Artwork';
import HScroll from '../ui/HScroll';
import SectionTitle from '../ui/SectionTitle';
import { useTracker } from '@/context/TrackerContext';
import { useEpisodeInfo, useTrackedProgress, type TrackedItem } from '@/hooks/useShowsProgress';
import { episodeCode } from '@/lib/format';

function UpNextCard({ item }: { item: TrackedItem }) {
	const { toggleWatched } = useTracker();
	const { show, info, progress } = item;
	const next = progress?.next;
	const episode = useEpisodeInfo(show.id, next?.season, next?.episode);

	if (!info || !progress || !next) return null;

	const markWatched = () => {
		toggleWatched(show.id, next.season, next.episode, { name: show.name, poster: show.poster });
	};

	return (
		<div className="relative flex flex-col gap-2.5 min-w-0 transition-opacity hover:opacity-90">
			<Link href={`/tv/${show.id}`} className="absolute inset-0 z-[1]" aria-label={show.name} />
			<Artwork src={episode?.still || info.backdrop} alt={show.name} className="aspect-video rounded-[14px] md:rounded-[16px]">
				<div className="absolute inset-x-0 bottom-0 pt-7 px-3 pb-3 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-2.5 text-white">
					<span className="text-[12px] font-bold whitespace-nowrap">{episodeCode(next.season, next.episode)}</span>
					<span className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
						<span className="block h-full rounded-full bg-white transition-[width] duration-300" style={{ width: `${progress.pct}%` }} />
					</span>
					<button
						type="button"
						onClick={markWatched}
						className="relative z-[2] w-[30px] h-[30px] shrink-0 rounded-full bg-white/[0.22] backdrop-blur-[12px] flex items-center justify-center transition-colors hover:bg-white/35"
						aria-label={`Segna ${episodeCode(next.season, next.episode)} come visto`}
						title="Segna come visto"
					>
						<Check size={15} />
					</button>
				</div>
			</Artwork>
			<span className="flex flex-col gap-px px-0.5 min-w-0">
				<span className="text-[14px] md:text-[15px] font-bold truncate">{show.name}</span>
				<span className="text-[13px] font-medium text-fg3 truncate">
					{episode?.name ? `${episode.name} · ` : ''}
					{progress.watched}/{progress.total} visti
				</span>
			</span>
		</div>
	);
}

/** "Prossimi episodi": il prossimo episodio da vedere di ogni serie seguita. */
export default function UpNextRow() {
	const { items, loading, isEmpty } = useTrackedProgress();

	if (isEmpty) return null;

	const upNext = items
		.filter((i) => i.progress?.next)
		.sort((a, b) => Number(b.progress?.started) - Number(a.progress?.started))
		.slice(0, 12);

	if (!loading && upNext.length === 0) return null;

	return (
		<section>
			<SectionTitle
				title="Prossimi episodi"
				href="/tracker"
				aside={<span className="hidden md:inline text-[13px] font-semibold text-fg3">Dalla tua Timeline</span>}
			/>
			<HScroll col="300px" mobileCol="250px" max="460px">
				{upNext.length === 0
					? Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="flex flex-col gap-2.5">
							<div className="aspect-video rounded-[16px] placeholder-stripes" />
							<span className="h-3.5 w-2/3 rounded bg-ph1" />
						</div>
					))
					: upNext.map((item) => <UpNextCard key={item.show.id} item={item} />)}
			</HScroll>
		</section>
	);
}
