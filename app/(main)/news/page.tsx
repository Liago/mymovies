import { getTrending, getUpcomingMovies, getNowPlayingMovies, getPopularTV } from '@/lib/tmdb';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Calendar, TrendingUp, Film, Tv, Star } from 'lucide-react';

export default async function NewsPage() {
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value || 'en-US';

	// Fetch multiple data sources for news
	const [trendingMovies, trendingTV, upcomingMovies, nowPlayingMovies, popularTV] = await Promise.all([
		getTrending('movie', 'week', lang),
		getTrending('tv', 'week', lang),
		getUpcomingMovies(1, lang),
		getNowPlayingMovies(1, lang),
		getPopularTV(1, lang)
	]);

	return (
		<main className="min-h-screen bg-black text-white pt-24 pb-20">
			<div className="max-w-7xl mx-auto px-6 md:px-12">
				{/* Header */}
				<div className="text-center py-12">
					<div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-zinc-900 border border-white/10 mb-8">
						<TrendingUp size={40} className="text-primary" />
					</div>
					<h1 className="text-5xl md:text-7xl font-black text-white mb-6">
						News & Updates
					</h1>
					<p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
						Stay up to date with the latest releases, trending content, and what's hot in entertainment
					</p>
				</div>

				{/* Trending This Week - Movies */}
				<section className="mb-16">
					<div className="flex items-center gap-3 mb-8">
						<Film className="text-primary" size={28} />
						<h2 className="text-3xl font-bold text-white">Trending Movies This Week</h2>
						<div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
						{trendingMovies.slice(0, 10).map((movie: any) => (
							<NewsCard
								key={movie.id}
								id={movie.id}
								title={movie.title}
								poster={movie.poster}
								rating={movie.rating}
								releaseDate={movie.releaseDate}
								type="movie"
							/>
						))}
					</div>
				</section>

				{/* Trending This Week - TV Shows */}
				<section className="mb-16">
					<div className="flex items-center gap-3 mb-8">
						<Tv className="text-secondary" size={28} />
						<h2 className="text-3xl font-bold text-white">Trending TV Shows This Week</h2>
						<div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
						{trendingTV.slice(0, 10).map((show: any) => (
							<NewsCard
								key={show.id}
								id={show.id}
								title={show.title}
								poster={show.poster}
								rating={show.rating}
								releaseDate={show.releaseDate}
								type="tv"
							/>
						))}
					</div>
				</section>

				{/* Upcoming Movies */}
				<section className="mb-16">
					<div className="flex items-center gap-3 mb-8">
						<Calendar className="text-primary" size={28} />
						<h2 className="text-3xl font-bold text-white">Coming Soon</h2>
						<div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
						{upcomingMovies.slice(0, 10).map((movie: any) => (
							<NewsCard
								key={movie.id}
								id={movie.id}
								title={movie.title}
								poster={movie.poster}
								rating={movie.rating}
								releaseDate={movie.releaseDate}
								type="movie"
								badge="Upcoming"
							/>
						))}
					</div>
				</section>

				{/* Now Playing */}
				<section className="mb-16">
					<div className="flex items-center gap-3 mb-8">
						<Film className="text-secondary" size={28} />
						<h2 className="text-3xl font-bold text-white">Now in Theaters</h2>
						<div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
						{nowPlayingMovies.slice(0, 10).map((movie: any) => (
							<NewsCard
								key={movie.id}
								id={movie.id}
								title={movie.title}
								poster={movie.poster}
								rating={movie.rating}
								releaseDate={movie.releaseDate}
								type="movie"
								badge="Now Playing"
							/>
						))}
					</div>
				</section>

				{/* Popular TV Shows */}
				<section className="mb-16">
					<div className="flex items-center gap-3 mb-8">
						<Tv className="text-primary" size={28} />
						<h2 className="text-3xl font-bold text-white">Popular TV Shows</h2>
						<div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
						{popularTV.slice(0, 10).map((show: any) => (
							<NewsCard
								key={show.id}
								id={show.id}
								title={show.title}
								poster={show.poster}
								rating={show.rating}
								releaseDate={show.releaseDate}
								type="tv"
							/>
						))}
					</div>
				</section>
			</div>
		</main>
	);
}

function NewsCard({
	id,
	title,
	poster,
	rating,
	releaseDate,
	type,
	badge
}: {
	id: number;
	title: string;
	poster: string;
	rating: number;
	releaseDate: string;
	type: 'movie' | 'tv';
	badge?: string;
}) {
	return (
		<Link
			href={`/${type}/${id}`}
			className="group relative block rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20"
		>
			{/* Badge */}
			{badge && (
				<div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-primary text-black text-xs font-bold uppercase tracking-wider">
					{badge}
				</div>
			)}

			{/* Poster */}
			<div className="aspect-[2/3] bg-zinc-800 relative overflow-hidden">
				{poster ? (
					<img
						src={poster}
						alt={title}
						className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-zinc-700">
						{type === 'movie' ? <Film size={48} /> : <Tv size={48} />}
					</div>
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
			</div>

			{/* Info */}
			<div className="p-4 space-y-2">
				<h3 className="font-bold text-white line-clamp-2 group-hover:text-primary transition-colors">
					{title}
				</h3>
				<div className="flex items-center justify-between text-xs text-zinc-400">
					<div className="flex items-center gap-1">
						<Star size={14} className="text-yellow-500 fill-yellow-500" />
						<span className="font-semibold text-white">{rating.toFixed(1)}</span>
					</div>
					{releaseDate && (
						<span className="text-zinc-500">
							{new Date(releaseDate).getFullYear()}
						</span>
					)}
				</div>
			</div>
		</Link>
	);
}
