'use client';

import { useTracker } from '@/context/TrackerContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatUpcomingPremiere } from '@/lib/tv-status';
import MovieCard from './MovieCard';

interface TVCardWithProgressProps {
	id: number;
	title: string;
	poster: string | null;
	rating?: number;
	year?: string;
	totalEpisodes?: number;
	/** TMDB `first_air_date`; shown as a badge while the premiere is still ahead. */
	firstAirDate?: string | null;
}

export default function TVCardWithProgress({ id, title, poster, rating, year, totalEpisodes, firstAirDate }: TVCardWithProgressProps) {
	const { getWatchedCount } = useTracker();
	const { language } = useLanguage();
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
			premiereLabel={formatUpcomingPremiere(firstAirDate, language)}
		/>
	);
}
