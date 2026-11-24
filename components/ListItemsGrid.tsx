'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { List } from 'lucide-react';
import { useLists } from '@/context/ListsContext';
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
import MovieCard from './MovieCard';
import TVCardWithProgress from './TVCardWithProgress';
import SeriesStatusFilter from './SeriesStatusFilter';
import RemovableGrid from './library/RemovableGrid';

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

const itemKey = (item: ListItem): string => `${item.media_type}-${item.id}`;
const itemTitle = (item: ListItem): string => item.title;

function renderItem(item: ListItem): React.ReactNode {
	return item.media_type === 'tv' ? (
		<TVCardWithProgress
			id={item.id}
			title={item.title}
			poster={item.poster}
			rating={item.rating}
			year={item.year}
			totalEpisodes={item.totalEpisodes}
			firstAirDate={item.firstAirDate}
		/>
	) : (
		<MovieCard id={item.id} title={item.title} poster={item.poster} rating={item.rating} year={item.year} type="movie" />
	);
}

export default function ListItemsGrid({ listId, items }: ListItemsGridProps) {
	const { getWatchedCount } = useTracker();
	const { t } = useLanguage();
	const { removeFromList } = useLists();
	const router = useRouter();
	const [mode, setMode] = useState<SeriesFilterMode>('all');

	const handleRemove = useCallback(
		async (toRemove: ListItem[]): Promise<void> => {
			await Promise.all(toRemove.map((item) => removeFromList(listId, item.id, item.media_type)));
			// Aggiorna conteggio e contenuto renderizzati dal server
			router.refresh();
		},
		[listId, removeFromList, router]
	);

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

			<RemovableGrid
				items={visibleItems}
				getKey={itemKey}
				getTitle={itemTitle}
				renderItem={renderItem}
				onRemove={handleRemove}
				fromLabel="dalla lista"
				empty={
					<div className="flex flex-col items-center text-center gap-3 py-14">
						<span className="w-16 h-16 rounded-full bg-bg2 flex items-center justify-center text-fg3">
							<List size={28} />
						</span>
						<p className="m-0 text-[14px] font-semibold text-fg3">{mode === 'all' ? 'Questa lista è vuota' : emptyText}</p>
					</div>
				}
			/>
		</div>
	);
}
