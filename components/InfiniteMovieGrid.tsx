'use client';

import { useState } from 'react';
import { fetchDiscoverMovies } from '@/app/actions';
import MovieCard from './MovieCard';

interface Movie {
	id: number;
	title: string;
	poster: string | null;
	rating?: number;
	year?: string;
	type?: 'movie' | 'tv';
}

interface InfiniteMovieGridProps {
	initialMovies: Movie[];
	actionType: 'discover' | 'tv' | 'upcoming';
}

export default function InfiniteMovieGrid({ initialMovies, actionType }: InfiniteMovieGridProps) {
	const [movies, setMovies] = useState<Movie[]>(initialMovies);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);

	const loadMore = async () => {
		setLoading(true);
		const nextPage = page + 1;

		let newMovies: Movie[] = [];
		if (actionType === 'discover') {
			newMovies = await fetchDiscoverMovies(nextPage);
		} else if (actionType === 'tv') {
			newMovies = await import('@/app/actions').then(mod => mod.fetchTVShows(nextPage));
		} else if (actionType === 'upcoming') {
			newMovies = await import('@/app/actions').then(mod => mod.fetchUpcomingMovies(nextPage));
		}

		setMovies([...movies, ...newMovies]);
		setPage(nextPage);
		setLoading(false);
	};

	return (
		<>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-6 md:gap-8">
				{movies.map((movie) => (
					<MovieCard key={`${movie.id}-${movie.title}`} {...movie} />
				))}
			</div>

			<div className="flex justify-center mt-12">
				<button
					onClick={loadMore}
					disabled={loading}
					className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Loading...' : 'Load More'}
				</button>
			</div>
		</>
	);
}
