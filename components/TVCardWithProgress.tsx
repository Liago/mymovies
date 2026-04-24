'use client';

import { useTracker } from '@/context/TrackerContext';
import MovieCard from './MovieCard';

interface TVCardWithProgressProps {
	id: number;
	title: string;
	poster: string | null;
	rating?: number;
	year?: string;
	totalEpisodes?: number;
}

export default function TVCardWithProgress({ id, title, poster, rating, year, totalEpisodes }: TVCardWithProgressProps) {
	const { getWatchedCount } = useTracker();
	const watched = getWatchedCount(id);

	const episodeProgress = watched > 0 && totalEpisodes
		? { watched, total: totalEpisodes }
		: undefined;

	return (
		<MovieCard
			id={id}
			title={title}
			poster={poster}
			rating={rating}
			year={year}
			type="tv"
			episodeProgress={episodeProgress}
		/>
	);
}
