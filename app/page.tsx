import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MovieCarousel from "@/components/MovieCarousel";
import { fetchDiscoverMovies, fetchTVShows, fetchMovieTrailer } from "@/app/actions";

export default async function Home() {
	const [movies, tvShows] = await Promise.all([
		fetchDiscoverMovies(),
		fetchTVShows()
	]);

	// Featured movie (first from popular)
	let featuredMovie = null;
	if (movies[0]) {
		const trailerUrl = await fetchMovieTrailer(movies[0].id);
		featuredMovie = {
			...movies[0],
			type: 'movie' as const,
			description: 'In a world where shadows whisper and light betrays, one hero must rise to challenge the darkness that threatens to consume everything they hold dear. Experience the epic journey that critics are calling a masterpiece.',
			trailerUrl
		};
	}

	// Sections
	const trendingMovies = movies.slice(1, 11).map((m: any) => ({ ...m, type: 'movie' as const }));
	const topRatedMovies = movies.slice(11, 21).map((m: any) => ({ ...m, type: 'movie' as const }));
	const popularTVShows = tvShows.slice(0, 10).map((t: any) => ({ ...t, type: 'tv' as const }));

	return (
		<main className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white">
			<Navbar />

			{featuredMovie && <HeroSection item={featuredMovie} />}

			<div className="relative z-10 -mt-32 pb-20 space-y-8">
				<MovieCarousel title="Trending Now" movies={trendingMovies} />
				<MovieCarousel title="Critically Acclaimed Movies" movies={topRatedMovies} />
				<MovieCarousel title="Binge-Worthy TV Shows" movies={popularTVShows} />
			</div>
		</main>
	);
}
