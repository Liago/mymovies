import { fetchDiscoverMovies } from '@/app/actions';
import InfiniteMovieGrid from '@/components/InfiniteMovieGrid';

export default async function MoviesPage() {
	const movies = await fetchDiscoverMovies(1);

	return (
		<main className="min-h-screen bg-black text-white pt-24 pb-20">
			<div className="max-w-[1920px] mx-auto px-6 md:px-12">
				{/* Header */}
				<div className="mb-12">
					<h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
						Trending Movies
						<span className="text-primary">.</span>
					</h1>
					<p className="text-zinc-400 text-lg max-w-xl">
						Discover the most popular movies right now.
					</p>
				</div>

				<InfiniteMovieGrid initialMovies={movies} />
			</div>
		</main>
	);
}
