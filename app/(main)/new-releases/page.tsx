import { fetchUpcomingMovies } from '@/app/actions';
import InfiniteMovieGrid from '@/components/InfiniteMovieGrid';

export default async function NewReleasesPage() {
	const movies = await fetchUpcomingMovies(1);

	return (
		<main className="min-h-screen bg-black text-white pt-24 pb-20">
			<div className="max-w-[1920px] mx-auto px-6 md:px-12">
				{/* Header */}
				<div className="mb-12">
					<h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
						New Releases
						<span className="text-primary">.</span>
					</h1>
					<p className="text-zinc-400 text-lg max-w-xl">
						Fresh from the cinema. Explore the latest blockbusters.
					</p>
				</div>

				<InfiniteMovieGrid initialMovies={movies} actionType="upcoming" />
			</div>
		</main>
	);
}
