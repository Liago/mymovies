'use client';

import { useMemo, useState } from 'react';
import { List } from 'lucide-react';
import { useTracker } from '@/context/TrackerContext';
import { useLanguage } from '@/context/LanguageContext';
import { isEndedToFinish, isWaitingForNewSeason, type SeriesFilterMode } from '@/lib/tv-status';
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
		item.media_type === 'tv' && isWaitingForNewSeason(item.status, getWatchedCount(item.id), item.totalEpisodes);

	const counts = useMemo(
		() => ({
			ended: items.filter(isEnded).length,
			returning: items.filter(isReturning).length,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[items, getWatchedCount]
	);

	const visibleItems =
		mode === 'ended' ? items.filter(isEnded) : mode === 'returning' ? items.filter(isReturning) : items;

	const emptyText = mode === 'returning' ? t('following.no_returning') : t('following.no_ended');

	return (
		<div>
			<div className="mb-8">
				<SeriesStatusFilter mode={mode} onChange={setMode} counts={counts} />
			</div>

			{visibleItems.length === 0 ? (
				<div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 border-dashed">
					<List size={40} className="mx-auto text-gray-600 mb-4" />
					<p className="text-gray-400">{emptyText}</p>
				</div>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
						/>
					))}
				</div>
			)}
		</div>
	);
}
