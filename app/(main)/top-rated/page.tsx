'use client';

import { useState, useEffect } from 'react';
import { fetchTopRatedMovies, fetchTopRatedTV } from '@/app/actions';
import MovieCard from '@/components/MovieCard';

interface Movie {
	id: number;
	title: string;
	poster: string | null;
	rating?: number;
	year?: string;
	type?: 'movie' | 'tv';
}

export default function TopRatedPage() {
	const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');
	const [movies, setMovies] = useState<Movie[]>([]);
	const [tvShows, setTVShows] = useState<Movie[]>([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		loadInitialData();
	}, []);

	const loadInitialData = async () => {
		const [moviesData, tvData] = await Promise.all([
			fetchTopRatedMovies(1),
			fetchTopRatedTV(1)
		]);
		setMovies(moviesData);
		setTVShows(tvData);
	};

	const loadMore = async () => {
		setLoading(true);
		const nextPage = page + 1;

		if (activeTab === 'movies') {
			const newMovies = await fetchTopRatedMovies(nextPage);
			setMovies([...movies, ...newMovies]);
		} else {
			const newTV = await fetchTopRatedTV(nextPage);
			setTVShows([...tvShows, ...newTV]);
		}

		setPage(nextPage);
		setLoading(false);
	};

	const handleTabChange = (tab: 'movies' | 'tv') => {
		setActiveTab(tab);
		setPage(1);
	};

	const currentData = activeTab === 'movies' ? movies : tvShows;

	return (
		<main className="min-h-screen bg-black text-white pt-24 pb-20">
			<div className="max-w-[1920px] mx-auto px-6 md:px-12">
				{/* Header */}
				<div className="mb-12">
					<h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
						Top Rated
						<span className="text-primary">.</span>
					</h1>
					<p className="text-zinc-400 text-lg max-w-xl">
						The highest rated movies and TV shows, as voted by users.
					</p>
				</div>

				{/* Tabs */}
				<div className="flex gap-4 mb-8 border-b border-zinc-800">
					<button
						onClick={() => handleTabChange('movies')}
						className={`px-6 py-3 font-bold transition-colors relative ${
							activeTab === 'movies'
								? 'text-white'
								: 'text-zinc-500 hover:text-zinc-300'
						}`}
					>
						Movies
						{activeTab === 'movies' && (
							<span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
						)}
					</button>
					<button
						onClick={() => handleTabChange('tv')}
						className={`px-6 py-3 font-bold transition-colors relative ${
							activeTab === 'tv'
								? 'text-white'
								: 'text-zinc-500 hover:text-zinc-300'
						}`}
					>
						TV Shows
						{activeTab === 'tv' && (
							<span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
						)}
					</button>
				</div>

				{/* Grid */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-6 md:gap-8">
					{currentData.map((item) => (
						<MovieCard key={`${item.id}-${item.title}`} {...item} />
					))}
				</div>

				{/* Load More Button */}
				<div className="flex justify-center mt-12">
					<button
						onClick={loadMore}
						disabled={loading}
						className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Loading...' : 'Load More'}
					</button>
				</div>
			</div>
		</main>
	);
}
