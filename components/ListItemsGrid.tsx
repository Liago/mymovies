'use client';

import { useMemo, useState } from 'react';
import { List } from 'lucide-react';
import { useTracker } from '@/context/TrackerContext';
import { useLanguage } from '@/context/LanguageContext';
import {
	isEndedToFinish,
	isWaitingForNewSeason,
	isOngoingRenewed,
	isWatching,
	isUpcoming,
	type SeriesFilterMode,
} from '@/lib/tv-status';
import ListItemCard from './ListItemCard';
import SeriesStatusFilter from './SeriesStatusFilter';

interface ListItem {
	id: number;
	title: string;
	poster: string | null;
	rating?: number;
	year?: string;
	media_type: 'movie' | 'tv';
	totalEpisodes?: number;
	status?: string;
	hasUpcomingEpisode?: boolean;
	hasAired?: boolean;
	firstAirDate?: string | null;
}

interface ListItemsGridProps {
	listId: number;
	items: ListItem[];
}

export default function ListItemsGrid({ listId, items }: ListItemsGridProps) {
	const { getWatchedCount } = useTracker();
	const { t } = useLanguage();
	const [mode, setMode] = useState<SeriesFilterMode>('all');

	const isEnded = (item: ListItem) =>
		item.media_type === 'tv' && isEndedToFinish(item.status, getWatchedCount(item.id), item.totalEpisodes);
	const isReturning = (item: ListItem) =>
		item.media_type === 'tv' && isWaitingForNewSeason(item.status, item.hasUpcomingEpisode, item.hasAired);
	const isOngoing = (item: ListItem) =>
		item.media_type === 'tv' && isOngoingRenewed(item.status, item.hasUpcomingEpisode, item.hasAired);
	const isNotYetAired = (item: ListItem) => item.media_type === 'tv' && isUpcoming(item.hasAired);
	const isInProgress = (item: ListItem) =>
		item.media_type === 'tv' && isWatching(getWatchedCount(item.id), item.totalEpisodes, item.hasAired);

	const counts = useMemo(
		() => ({
			watching: items.filter(isInProgress).length,
			ended: items.filter(isEnded).length,
			returning: items.filter(isReturning).length,
			ongoing: items.filter(isOngoing).length,
			upcoming: items.filter(isNotYetAired).length,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[items, getWatchedCount]
	);

	const visibleItems =
		mode === 'watching'
			? items.filter(isInProgress)
			: mode === 'ended'
			? items.filter(isEnded)
			: mode === 'returning'
			? items.filter(isReturning)
			: mode === 'ongoing'
			? items.filter(isOngoing)
			: mode === 'upcoming'
			? items.filter(isNotYetAired)
			: items;

	const emptyText =
		mode === 'watching'
			? t('following.no_watching')
			: mode === 'returning'
			? t('following.no_returning')
			: mode === 'ongoing'
			? t('following.no_ongoing')
			: mode === 'upcoming'
			? t('following.no_upcoming')
			: t('following.no_ended');

	return (
		<div>
			<div className="mb-6">
				<SeriesStatusFilter mode={mode} onChange={setMode} counts={counts} />
			</div>

			{visibleItems.length === 0 ? (
				<div className="flex flex-col items-center text-center gap-3 py-14">
					<span className="w-16 h-16 rounded-full bg-bg2 flex items-center justify-center text-fg3">
						<List size={28} />
					</span>
					<p className="m-0 text-[14px] font-semibold text-fg3">{emptyText}</p>
				</div>
			) : (
				<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-2.5 gap-y-3.5 md:gap-x-[18px] md:gap-y-[22px]">
					{visibleItems.map((item) => (
						<ListItemCard
							key={`${item.media_type}-${item.id}`}
							listId={listId}
							id={item.id}
							title={item.title}
							poster={item.poster}
							rating={item.rating}
							year={item.year}
							type={item.media_type}
							totalEpisodes={item.totalEpisodes}
							firstAirDate={item.firstAirDate}
						/>
					))}
				</div>
			)}
		</div>
	);
}
