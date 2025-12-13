import { fetchNowPlayingMovies } from '@/app/actions';
import InfiniteMovieGrid from '@/components/InfiniteMovieGrid';

export default async function NowPlayingPage() {
	const movies = await fetchNowPlayingMovies(1);

	return (
		<main className="min-h-screen bg-black text-white pt-24 pb-20">
			<div className="max-w-[1920px] mx-auto px-6 md:px-12">
				{/* Header */}
				<div className="mb-12">
					<h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
						Now Playing
						<span className="text-primary">.</span>
					</h1>
					<p className="text-zinc-400 text-lg max-w-xl">
						Currently in theaters. Watch the latest movies on the big screen.
					</p>
				</div>

				<InfiniteMovieGrid initialMovies={movies} actionType="nowPlaying" />
			</div>
		</main>
	);
}
