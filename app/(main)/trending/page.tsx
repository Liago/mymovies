import { fetchTrending } from '@/app/actions';
import InfiniteMovieGrid from '@/components/InfiniteMovieGrid';

export default async function TrendingPage() {
	const trending = await fetchTrending('all', 'week');

	return (
		<main className="min-h-screen bg-black text-white pt-24 pb-20">
			<div className="max-w-[1920px] mx-auto px-6 md:px-12">
				{/* Header */}
				<div className="mb-12">
					<h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
						Trending
						<span className="text-primary">.</span>
					</h1>
					<p className="text-zinc-400 text-lg max-w-xl">
						What's hot this week. Discover the most popular movies, TV shows and people.
					</p>
				</div>

				<InfiniteMovieGrid initialMovies={trending} actionType="trending" />
			</div>
		</main>
	);
}
